import express from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Test GitHub token validity
router.get('/github-token', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const githubToken = (req as any).cookies?.github_token;
    
    if (!githubToken) {
      return res.json({
        success: false,
        error: 'No GitHub token found in cookies',
      });
    }

    // Test the token with GitHub API
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const data = await response.json() as any;

    if (response.ok) {
      res.json({
        success: true,
        tokenValid: true,
        user: {
          login: data.login,
          id: data.id,
          name: data.name,
        },
        tokenPrefix: githubToken.substring(0, 10) + '...',
      });
    } else {
      res.json({
        success: true,
        tokenValid: false,
        error: data.message,
        tokenPrefix: githubToken.substring(0, 10) + '...',
      });
    }
  } catch (error) {
    logger.error('GitHub token test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test GitHub token',
    });
  }
});

export default router;
