import express from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { GitHubService } from '../services/githubService';
import { prisma } from '../app';
import { logger } from '../utils/logger';

const router = express.Router();

// Get GitHub user stats
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Get GitHub token from cookies
    const githubToken = req.cookies?.github_token;
    const username = req.user!.username;

    if (!githubToken || !username) {
      return res.status(400).json({
        success: false,
        error: 'GitHub account not connected',
      });
    }

    const githubService = new GitHubService(githubToken);
    const stats = await githubService.getUserStats(username);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching GitHub stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch GitHub stats',
    });
  }
});

// Get user repositories
router.get('/repositories', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get GitHub token from cookies
    const githubToken = req.cookies?.github_token;
    const username = req.user!.username;

    if (!githubToken || !username) {
      return res.status(400).json({
        success: false,
        error: 'GitHub account not connected',
      });
    }

    const githubService = new GitHubService(githubToken);
    const repositories = await githubService.getUserRepositories(
      username,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: repositories,
    });
  } catch (error) {
    logger.error('Error fetching repositories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch repositories',
    });
  }
});

// Get repository stats
router.get('/repository/:owner/:repo', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { owner, repo } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        // githubAccessToken: true, // Field doesn't exist in schema
      },
    });

    // Skip GitHub access token check - using cookie-based auth
    const githubToken = req.cookies?.github_token;
    if (!githubToken) {
      return res.status(400).json({
        success: false,
        error: 'GitHub account not connected',
      });
    }

    const githubService = new GitHubService(githubToken);
    const repoStats = await githubService.getRepositoryStats(owner, repo);

    res.json({
      success: true,
      data: repoStats,
    });
  } catch (error) {
    logger.error('Error fetching repository stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch repository stats',
    });
  }
});

// Sync GitHub data
router.post('/sync', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        // githubAccessToken: true, // Field doesn't exist in schema
        // githubUsername: true, // Field doesn't exist in schema
      },
    });

    // Skip GitHub access token check - using cookie-based auth
    const githubToken = req.cookies?.github_token;
    const username = req.user!.username;
    
    if (!githubToken || !username) {
      return res.status(400).json({
        success: false,
        error: 'GitHub account not connected',
      });
    }

    const githubService = new GitHubService(githubToken);
    const stats = await githubService.syncUserData(req.user!.id, username);

    res.json({
      success: true,
      message: 'GitHub data synchronized successfully',
      data: stats,
    });
  } catch (error) {
    logger.error('Error syncing GitHub data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync GitHub data',
    });
  }
});

// Get commit activity for a repository
router.get('/activity/:owner/:repo', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { owner, repo } = req.params;
    const { days = 30 } = req.query;
    
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        // githubAccessToken: true, // Field doesn't exist in schema
      },
    });

    // Skip GitHub access token check - using cookie-based auth
    const githubToken = req.cookies?.github_token;
    if (!githubToken) {
      return res.status(400).json({
        success: false,
        error: 'GitHub account not connected',
      });
    }

    const githubService = new GitHubService(githubToken);
    const activity = await githubService.getCommitActivity(owner, repo, parseInt(days as string));

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    logger.error('Error fetching commit activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch commit activity',
    });
  }
});

export default router;
