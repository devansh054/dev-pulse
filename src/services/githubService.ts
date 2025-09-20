import { Octokit } from '@octokit/rest';
import { prisma } from '../app';
import { logger } from '../utils/logger';

export interface GitHubUserStats {
  totalRepos: number;
  followers: number;
  following: number;
  recentCommits: number;
  recentPRs: number;
  recentIssues: number;
  contributionStreak: number;
  topLanguages: string[];
}

export interface GitHubRepoStats {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  languages: string[];
  contributors: number;
  lastUpdated: string;
  commits: number;
}

export class GitHubService {
  public octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  async getUserStats(username: string): Promise<GitHubUserStats> {
    try {
      // Get user profile
      const { data: user } = await this.octokit.users.getByUsername({
        username,
      });

      logger.info(`GitHub User Profile for ${username}:`, {
        public_repos: user.public_repos,
        total_private_repos: user.total_private_repos,
        owned_private_repos: user.owned_private_repos
      });

      // Get user repositories to calculate total repos
      const { data: allRepos } = await this.octokit.repos.listForAuthenticatedUser({
        per_page: 100,
        visibility: 'all',
      });

      logger.info(`All repositories fetched:`, {
        count: allRepos.length,
        publicCount: allRepos.filter(r => !r.private).length,
        privateCount: allRepos.filter(r => r.private).length
      });

      // Get recent events (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: events } = await this.octokit.activity.listPublicEventsForUser({
        username,
        per_page: 100,
      });

      // Filter recent events
      const recentEvents = events.filter(event => 
        new Date(event.created_at!) > thirtyDaysAgo
      );

      // Count different event types
      const recentCommits = recentEvents.filter(e => e.type === 'PushEvent').length;
      const recentPRs = recentEvents.filter(e => e.type === 'PullRequestEvent').length;
      const recentIssues = recentEvents.filter(e => e.type === 'IssuesEvent').length;

      // Get user's repositories for language analysis
      const { data: repos } = await this.octokit.repos.listForUser({
        username,
        sort: 'updated',
        per_page: 50,
      });

      // Analyze top languages
      const languageCount: { [key: string]: number } = {};
      for (const repo of repos.slice(0, 10)) { // Check top 10 repos
        try {
          const { data: languages } = await this.octokit.repos.listLanguages({
            owner: username,
            repo: repo.name,
          });
          
          Object.keys(languages).forEach(lang => {
            languageCount[lang] = (languageCount[lang] || 0) + 1;
          });
        } catch (error) {
          // Skip if can't access repo languages
          continue;
        }
      }

      const topLanguages = Object.entries(languageCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([lang]) => lang);

      // Calculate contribution streak (simplified)
      const contributionStreak = this.calculateContributionStreak(recentEvents);

      return {
        totalRepos: user.public_repos, // Use GitHub's public repo count from user profile
        followers: user.followers,
        following: user.following,
        recentCommits,
        recentPRs,
        recentIssues,
        contributionStreak,
        topLanguages,
      };
    } catch (error) {
      logger.error('GitHub API error:', error);
      throw new Error('Failed to fetch GitHub stats');
    }
  }

  async getRepositoryStats(owner: string, repo: string): Promise<GitHubRepoStats> {
    try {
      const { data: repository } = await this.octokit.repos.get({
        owner,
        repo,
      });

      const { data: languages } = await this.octokit.repos.listLanguages({
        owner,
        repo,
      });

      const { data: contributors } = await this.octokit.repos.listContributors({
        owner,
        repo,
      });

      // Get commit count (approximate)
      const { data: commits } = await this.octokit.repos.listCommits({
        owner,
        repo,
        per_page: 1,
      });

      return {
        name: repository.name,
        description: repository.description,
        stars: repository.stargazers_count,
        forks: repository.forks_count,
        openIssues: repository.open_issues_count,
        languages: Object.keys(languages),
        contributors: contributors.length,
        lastUpdated: repository.updated_at,
        commits: commits.length > 0 ? 1 : 0, // Simplified commit count
      };
    } catch (error) {
      logger.error('Repository stats error:', error);
      throw new Error('Failed to fetch repository stats');
    }
  }

  async syncUserData(userId: number, githubUsername: string): Promise<GitHubUserStats> {
    try {
      const stats = await this.getUserStats(githubUsername);
      
      // Store daily metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Store daily metrics
      const existingMetric = await prisma.dailyMetric.findFirst({
        where: {
          userId: userId,
          date: today,
        },
      });

      if (existingMetric) {
        await prisma.dailyMetric.update({
          where: { id: existingMetric.id },
          data: {
            commitsCount: stats.recentCommits,
            prsOpened: stats.recentPRs,
            issuesClosed: stats.recentIssues,
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.dailyMetric.create({
          data: {
            userId,
            date: today,
            commitsCount: stats.recentCommits,
            prsOpened: stats.recentPRs,
            issuesClosed: stats.recentIssues,
          },
        });
      }

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          type: 'sync',
          title: 'GitHub data synchronized',
          description: `Synced ${stats.recentCommits} commits, ${stats.recentPRs} PRs, ${stats.recentIssues} issues`,
          metadata: {
            stats: stats as any,
            syncedAt: new Date().toISOString(),
          },
        },
      });

      logger.info(`Synced GitHub data for user ${userId}`, { stats });
      return stats;
    } catch (error) {
      logger.error('Sync error:', error);
      throw error;
    }
  }

  async getUserRepositories(username: string, limit: number = 10) {
    try {
      // Use listForAuthenticatedUser to get both public and private repos
      const { data: repos } = await this.octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100, // Increase to get all repositories
        visibility: 'public', // Only public repos to match profile count
      });

      return repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        isPrivate: repo.private,
        updatedAt: repo.updated_at,
        htmlUrl: repo.html_url,
      }));
    } catch (error) {
      logger.error('Error fetching repositories:', error);
      // Fallback to public repos only if authenticated user repos fail
      try {
        const { data: publicRepos } = await this.octokit.repos.listForUser({
          username,
          sort: 'updated',
          per_page: limit,
        });
        
        return publicRepos.map(repo => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          openIssues: repo.open_issues_count,
          isPrivate: repo.private,
          updatedAt: repo.updated_at,
          htmlUrl: repo.html_url,
        }));
      } catch (fallbackError) {
        logger.error('Error fetching public repositories:', fallbackError);
        throw new Error('Failed to fetch repositories');
      }
    }
  }

  private calculateContributionStreak(events: any[]): number {
    // Simplified streak calculation
    // In a real implementation, you'd use GitHub's contribution calendar API
    const commitEvents = events.filter(e => e.type === 'PushEvent');
    const uniqueDays = new Set(
      commitEvents.map(e => new Date(e.created_at!).toDateString())
    );
    
    return uniqueDays.size;
  }

  async getCommitActivity(username: string, repo: string, days: number = 30) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data: commits } = await this.octokit.repos.listCommits({
        owner: username,
        repo,
        since: since.toISOString(),
        per_page: 100,
      });

      // Group commits by date
      const commitsByDate: { [key: string]: number } = {};
      commits.forEach(commit => {
        const date = new Date(commit.commit.author!.date!).toDateString();
        commitsByDate[date] = (commitsByDate[date] || 0) + 1;
      });

      return Object.entries(commitsByDate).map(([date, count]) => ({
        date,
        commits: count,
      }));
    } catch (error) {
      logger.error('Error fetching commit activity:', error);
      throw new Error('Failed to fetch commit activity');
    }
  }
}
