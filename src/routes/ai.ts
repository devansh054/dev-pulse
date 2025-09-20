import express from 'express';
import { HuggingFaceService } from '../services/huggingFaceService';
import { GitHubService } from '../services/githubService';
import { logger } from '../utils/logger';
import { prisma } from '../app';

const router = express.Router();

// Get AI insights for a user
router.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's GitHub data from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Get GitHub token from cookies
    const githubToken = req.cookies?.github_token;
    
    if (!githubToken) {
      return res.status(401).json({
        success: false,
        error: 'GitHub token required for insights'
      });
    }

    // Initialize GitHub service with user's token
    const githubService = new GitHubService(githubToken);
    const username = user.username;
    
    // Fetch real GitHub data
    const githubStats = await githubService.getUserStats(username);
    const repositories = await githubService.getUserRepositories(username, 100);
    
    // Debug logging
    logger.info(`GitHub Stats for ${username}:`, {
      totalRepos: githubStats.totalRepos,
      publicRepos: repositories.length,
      repositoryNames: repositories.map(r => r.name),
      repositoryDetails: repositories.map(r => ({
        name: r.name,
        stars: r.stars,
        openIssues: r.openIssues,
        isPrivate: r.isPrivate
      }))
    });
    
    // Generate insights based on real GitHub data
    const totalStars = repositories.reduce((sum: number, repo: any) => sum + (repo.stars || 0), 0);
    const totalOpenIssues = repositories.reduce((sum: number, repo: any) => sum + (repo.openIssues || 0), 0);
    
    logger.info(`Repository Health Calculation:`, {
      repositoryCount: repositories.length,
      totalStars,
      totalOpenIssues,
      githubStatsRepoCount: githubStats.totalRepos
    });
    
    const insights = [
      {
        id: '1',
        title: 'Repository Health Score',
        description: `Your ${repositories.length} public repositories have ${totalStars} total stars and ${totalOpenIssues} open issues. Primary languages: ${githubStats.topLanguages.slice(0, 3).join(', ')}.`,
        type: 'code_quality',
        priority: 'medium',
        actionable: true,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Productivity Analysis',
        description: `Based on your ${githubStats.recentCommits} commits and ${githubStats.recentPRs} PRs in the last 30 days, you're maintaining ${githubStats.recentCommits > 20 ? 'excellent' : githubStats.recentCommits > 10 ? 'good' : 'moderate'} development velocity.`,
        type: 'productivity',
        priority: githubStats.recentCommits > 20 ? 'low' : 'medium',
        actionable: githubStats.recentCommits <= 10,
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Code Quality Optimization',
        description: `Consider adding documentation to your repositories. ${Math.round((repositories.filter((r: any) => r.hasReadme).length / repositories.length) * 100)}% of your repos have README files. Well-documented code improves collaboration and maintainability.`,
        type: 'code_quality',
        priority: 'low',
        actionable: true,
        timestamp: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Collaboration Insight',
        description: `Your repositories average ${(repositories.reduce((sum: number, r: any) => sum + (r.forks || 0), 0) / repositories.length).toFixed(1)} forks each. Consider contributing to open source projects or encouraging community contributions to boost collaboration.`,
        type: 'collaboration',
        priority: 'low',
        actionable: true,
        timestamp: new Date().toISOString()
      },
      {
        id: '5',
        title: 'Performance Focus',
        description: `Your most active language is ${githubStats.topLanguages[0] || 'JavaScript'}. Consider exploring performance optimization techniques and modern frameworks to enhance your development efficiency.`,
        type: 'performance',
        priority: 'medium',
        actionable: true,
        timestamp: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get AI insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI insights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get code suggestions
router.post('/code-suggestions', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Code snippet is required'
      });
    }
    
    const suggestions = await HuggingFaceService.generateCodeSuggestions(code);
    
    res.json({
      success: true,
      data: {
        suggestions,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to get code suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate code suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get AI-powered developer health score
router.get('/health-score/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's GitHub data from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Get GitHub token from cookies
    const githubToken = req.cookies?.github_token;
    
    if (!githubToken) {
      return res.status(401).json({
        success: false,
        error: 'GitHub token required for health score'
      });
    }

    // Initialize GitHub service with user's token
    const githubService = new GitHubService(githubToken);
    const username = user.username;
    
    // Fetch real GitHub data for health score
    const githubStats = await githubService.getUserStats(username);
    const repositories = await githubService.getUserRepositories(username, 100);
    
    // Get recent GitHub events for commit analysis
    const { data: events } = await githubService.octokit.activity.listPublicEventsForUser({
      username,
      per_page: 100,
    });
    
    // Filter recent events (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEvents = events.filter(event => 
      new Date(event.created_at!) > thirtyDaysAgo
    );
    
    const userData = {
      commits: recentEvents.filter(e => e.type === 'PushEvent'),
      repositories: repositories,
      pullRequests: recentEvents.filter(e => e.type === 'PullRequestEvent'),
      issues: recentEvents.filter(e => e.type === 'IssuesEvent')
    };
    
    // Calculate AI-powered health score with real data
    const healthScore = calculateHealthScore(userData);
    
    res.json({
      success: true,
      data: {
        score: healthScore.score,
        factors: healthScore.factors,
        recommendations: healthScore.recommendations,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to calculate health score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate health score',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

function calculateHealthScore(userData: any) {
  let score = 0;
  const factors: any[] = [];
  const recommendations: string[] = [];
  
  // Commit frequency (30 points) - now uses real GitHub events
  const commitCount = userData.commits?.length || 0;
  if (commitCount > 15) {
    score += 30;
    factors.push({ name: 'Commit Frequency', score: 30, status: 'excellent' });
  } else if (commitCount > 8) {
    score += 20;
    factors.push({ name: 'Commit Frequency', score: 20, status: 'good' });
    recommendations.push('Maintain consistent commit frequency');
  } else {
    score += 10;
    factors.push({ name: 'Commit Frequency', score: 10, status: 'needs_improvement' });
    recommendations.push('Increase development activity with more frequent commits');
  }
  
  // Repository diversity (25 points) - now uses real repositories
  const repoCount = userData.repositories?.length || 0;
  const languages = new Set(userData.repositories?.map((r: any) => r.language).filter(Boolean) || []);
  
  if (repoCount > 10 && languages.size > 3) {
    score += 25;
    factors.push({ name: 'Repository Diversity', score: 25, status: 'excellent' });
  } else if (repoCount > 5 && languages.size > 2) {
    score += 18;
    factors.push({ name: 'Repository Diversity', score: 18, status: 'good' });
  } else {
    score += 10;
    factors.push({ name: 'Repository Diversity', score: 10, status: 'needs_improvement' });
    recommendations.push('Explore different programming languages and project types');
  }
  
  // Collaboration (25 points) - now uses real GitHub events
  const prCount = userData.pullRequests?.length || 0;
  const issueCount = userData.issues?.length || 0;
  
  if (prCount > 5 || issueCount > 3) {
    score += 25;
    factors.push({ name: 'Collaboration', score: 25, status: 'excellent' });
  } else if (prCount > 2 || issueCount > 1) {
    score += 18;
    factors.push({ name: 'Collaboration', score: 18, status: 'good' });
  } else {
    score += 8;
    factors.push({ name: 'Collaboration', score: 8, status: 'needs_improvement' });
    recommendations.push('Increase collaboration through pull requests and issue discussions');
  }
  
  // Code quality indicators (20 points) - now uses real repository data
  const totalStars = userData.repositories?.reduce((sum: number, r: any) => sum + (r.stars || 0), 0) || 0;
  const totalForks = userData.repositories?.reduce((sum: number, r: any) => sum + (r.forks || 0), 0) || 0;
  
  if (totalStars > 50 || totalForks > 25) {
    score += 20;
    factors.push({ name: 'Code Impact', score: 20, status: 'excellent' });
  } else if (totalStars > 10 || totalForks > 5) {
    score += 15;
    factors.push({ name: 'Code Impact', score: 15, status: 'good' });
  } else {
    score += 8;
    factors.push({ name: 'Code Impact', score: 8, status: 'needs_improvement' });
    recommendations.push('Focus on creating high-quality, reusable code that others find valuable');
  }
  
  return {
    score: Math.min(score, 100),
    factors,
    recommendations
  };
}

export default router;
