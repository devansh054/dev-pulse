import express from 'express';
import axios from 'axios';
import { logger } from '../utils/logger';

const router = express.Router();

// Extend Request interface to include githubToken
declare global {
  namespace Express {
    interface Request {
      githubToken?: string;
    }
  }
}

// Middleware to get GitHub token from localStorage data
const getGitHubToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  req.githubToken = token;
  next();
};

// Get user's repositories
router.get('/repositories', getGitHubToken, async (req, res) => {
  try {
    logger.info('Fetching repositories with token:', req.githubToken?.substring(0, 10) + '...');
    
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${req.githubToken}`,
        'User-Agent': 'DevPulse-App',
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        sort: 'updated',
        per_page: 50,
        type: 'owner'
      }
    });

    const repos = response.data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updated_at: repo.updated_at,
      created_at: repo.created_at,
      private: repo.private,
      html_url: repo.html_url
    }));

    res.json({ repositories: repos });
  } catch (error: any) {
    logger.error('Failed to fetch repositories:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch repositories', details: error.response?.data || error.message });
  }
});

// Get user's recent activity
router.get('/activity', getGitHubToken, async (req, res) => {
  try {
    const username = req.query.username as string;
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }

    const response = await axios.get(`https://api.github.com/users/${username}/events/public`, {
      headers: {
        Authorization: `token ${req.githubToken}`,
        'User-Agent': 'DevPulse-App',
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        per_page: 30
      }
    });

    const activities = response.data.map((event: any) => ({
      id: event.id,
      type: event.type,
      repo: event.repo?.name,
      created_at: event.created_at,
      payload: {
        action: event.payload?.action,
        commits: event.payload?.commits?.length || 0,
        ref: event.payload?.ref,
        ref_type: event.payload?.ref_type
      }
    }));

    res.json({ activities });
  } catch (error: any) {
    logger.error('Failed to fetch activity:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch activity', details: error.response?.data || error.message });
  }
});

// Get repository commits
router.get('/commits/:owner/:repo', getGitHubToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      headers: {
        Authorization: `token ${req.githubToken}`,
        'User-Agent': 'DevPulse-App',
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        per_page: 20
      }
    });

    const commits = response.data.map((commit: any) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      html_url: commit.html_url
    }));

    res.json({ commits });
  } catch (error: any) {
    logger.error('Failed to fetch commits:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch commits', details: error.response?.data || error.message });
  }
});

// Get user's contribution stats
router.get('/stats', getGitHubToken, async (req, res) => {
  try {
    const username = req.query.username as string;
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }

    // Get user's repositories for stats calculation
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${req.githubToken}`,
        'User-Agent': 'DevPulse-App',
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        per_page: 100,
        type: 'owner'
      }
    });

    const repos = reposResponse.data;
    const totalStars = repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0);
    const languages = repos.reduce((langs: any, repo: any) => {
      if (repo.language) {
        langs[repo.language] = (langs[repo.language] || 0) + 1;
      }
      return langs;
    }, {});

    const stats = {
      totalRepositories: repos.length,
      totalStars,
      totalForks,
      publicRepos: repos.filter((repo: any) => !repo.private).length,
      privateRepos: repos.filter((repo: any) => repo.private).length,
      topLanguages: Object.entries(languages)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([lang, count]) => ({ language: lang, count }))
    };

    res.json({ stats });
  } catch (error: any) {
    logger.error('Failed to fetch stats:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.response?.data || error.message });
  }
});

export default router;
