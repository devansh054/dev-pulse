import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { prisma } from '../app';
import { logger } from '../utils/logger';

const router = express.Router();

// Simple GitHub token authentication - bypasses OAuth completely
router.post('/github-token', async (req, res) => {
  try {
    const { githubToken } = req.body;
    
    if (!githubToken) {
      return res.status(400).json({
        success: false,
        error: 'GitHub token is required'
      });
    }

    // Verify token with GitHub API
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        'User-Agent': 'DevPulse-App'
      }
    });

    const githubUser = userResponse.data;

    // Get user's email
    let primaryEmail = githubUser.email;
    if (!primaryEmail) {
      try {
        const emailResponse = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            'User-Agent': 'DevPulse-App'
          }
        });
        primaryEmail = emailResponse.data.find((email: any) => email.primary)?.email;
      } catch (error) {
        // If we can't get email, use a placeholder
        primaryEmail = `${githubUser.login}@github.local`;
      }
    }

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { githubId: githubUser.id },
      update: {
        email: primaryEmail,
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        name: githubUser.name,
        updatedAt: new Date()
      },
      create: {
        githubId: githubUser.id,
        email: primaryEmail,
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        name: githubUser.name,
      }
    });

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = jwt.sign(
      { 
        id: user.id.toString(), 
        githubId: user.githubId,
        username: user.username 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    logger.info('GitHub token authentication successful', { 
      userId: user.id, 
      username: user.username 
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        name: user.name
      }
    });

  } catch (error) {
    logger.error('GitHub token authentication failed:', error);
    
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Invalid GitHub token'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

// Quick demo user creation (for immediate testing)
router.post('/demo-user', async (req, res) => {
  try {
    // Create a demo user with fake GitHub data
    const demoUser = await prisma.user.upsert({
      where: { githubId: 999999999 },
      update: {
        email: 'demo@devpulse.app',
        username: 'demo-user',
        avatarUrl: 'https://github.com/github.png',
        name: 'Demo User',
        updatedAt: new Date()
      },
      create: {
        githubId: 999999999,
        email: 'demo@devpulse.app',
        username: 'demo-user',
        avatarUrl: 'https://github.com/github.png',
        name: 'Demo User'
      }
    });

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = jwt.sign(
      { 
        id: demoUser.id.toString(), 
        githubId: demoUser.githubId,
        username: demoUser.username 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: demoUser.id,
        email: demoUser.email,
        username: demoUser.username,
        avatarUrl: demoUser.avatarUrl,
        name: demoUser.name
      }
    });

  } catch (error) {
    logger.error('Demo user creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create demo user'
    });
  }
});

export default router;
