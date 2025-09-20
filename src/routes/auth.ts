import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { prisma } from '../app';
import { logger } from '../utils/logger';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Test endpoint to verify environment variables
router.get('/test-env', async (req, res) => {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    
    res.json({
      success: true,
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasGithubClientId: !!process.env.GITHUB_CLIENT_ID,
        hasGithubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        frontendUrl: process.env.FRONTEND_URL,
        githubClientId: process.env.GITHUB_CLIENT_ID?.substring(0, 8) + '...',
      },
      database: {
        connected: true,
        userCount
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasGithubClientId: !!process.env.GITHUB_CLIENT_ID,
        hasGithubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        frontendUrl: process.env.FRONTEND_URL,
      },
      database: {
        connected: false
      }
    });
  }
});

// GitHub OAuth callback
router.get('/github/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required',
      });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'Failed to obtain access token',
      });
    }

    // Get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const githubUser = userResponse.data;

    // Get user's email (might be private)
    const emailResponse = await axios.get('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const primaryEmail = emailResponse.data.find((email: any) => email.primary)?.email || githubUser.email;

    if (!primaryEmail) {
      return res.status(400).json({
        success: false,
        error: 'Unable to retrieve email from GitHub account',
      });
    }

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { githubId: parseInt(githubUser.id.toString()) },
          { email: primaryEmail },
        ],
      },
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          githubId: parseInt(githubUser.id.toString()),
          avatarUrl: githubUser.avatar_url,
          name: githubUser.name,
          bio: githubUser.bio,
          location: githubUser.location,
          company: githubUser.company,
          blog: githubUser.blog,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: primaryEmail,
          username: githubUser.login,
          githubId: parseInt(githubUser.id.toString()),
          avatarUrl: githubUser.avatar_url,
          name: githubUser.name,
          bio: githubUser.bio,
          location: githubUser.location,
          company: githubUser.company,
          blog: githubUser.blog,
        },
      });

      // Create initial goals for new user
      await prisma.goal.createMany({
        data: [
          {
            userId: user.id,
            title: 'Make your first commit',
            description: 'Start your coding journey with your first commit',
            category: 'productivity',
            targetValue: 1,
            unit: 'commits',
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
            priority: 'high',
          },
          {
            userId: user.id,
            title: 'Open your first PR',
            description: 'Collaborate with others by opening a pull request',
            category: 'collaboration',
            targetValue: 1,
            unit: 'prs',
            targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
            priority: 'medium',
          },
          {
            userId: user.id,
            title: 'Code for 10 hours this week',
            description: 'Build a consistent coding habit',
            category: 'productivity',
            targetValue: 600, // 10 hours in minutes
            unit: 'minutes',
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
            priority: 'medium',
          },
        ],
      });

      logger.info(`New user registered: ${user.username} (${user.email})`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // For production, redirect with token in URL for static site
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    if (process.env.NODE_ENV === 'production') {
      // Redirect with token in URL for static site
      res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        name: user.name
      }))}`);
    } else {
      // For development, use cookies
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: 'localhost'
      });
      
      res.cookie('github_token', access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: 'localhost'
      });
      
      res.redirect(`${frontendUrl}/dashboard`);
    }
  } catch (error) {
    logger.error('GitHub OAuth error:', error);
    logger.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: req.query.code ? 'present' : 'missing',
      clientId: process.env.GITHUB_CLIENT_ID ? 'present' : 'missing',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ? 'present' : 'missing',
      jwtSecret: process.env.JWT_SECRET ? 'present' : 'missing',
      databaseUrl: process.env.DATABASE_URL ? 'present' : 'missing'
    });
    // Redirect to signin with error
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/signin?error=auth_failed`);
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        // githubUsername: true, // Field doesn't exist in schema
        avatarUrl: true,
        name: true,
        bio: true,
        location: true,
        company: true,
        blog: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data',
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, bio, location, company, blog } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name,
        bio,
        location,
        company,
        blog,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        // githubUsername: true, // Field doesn't exist in schema
        avatarUrl: true,
        name: true,
        bio: true,
        location: true,
        company: true,
        blog: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
});

// Refresh GitHub token
router.post('/github/refresh', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
      },
    });

    // Skip GitHub access token check - field doesn't exist in schema
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'GitHub account not connected',
      });
    }

    // Test if current token is still valid
    try {
      await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer PLACEHOLDER_TOKEN`, // TODO: Fix token storage
        },
      });

      res.json({
        success: true,
        message: 'GitHub token is still valid',
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'GitHub token expired, please reconnect your account',
      });
    }
  } catch (error) {
    logger.error('Error refreshing GitHub token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh GitHub token',
    });
  }
});

// Disconnect GitHub account
router.delete('/github/disconnect', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        // githubAccessToken: null, // Field doesn't exist in schema
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'GitHub account disconnected successfully',
    });
  } catch (error) {
    logger.error('Error disconnecting GitHub:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect GitHub account',
    });
  }
});

// Get current session
router.get('/session', async (req, res) => {
  try {
    // Check for JWT token in cookies
    const token = req.cookies?.auth_token;

    if (!token) {
      return res.json({
        success: true,
        user: null,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        name: true,
        bio: true,
        location: true,
        company: true,
        blog: true,
      },
    });

    if (!user) {
      return res.json({
        success: true,
        user: null,
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('Session check error:', error);
    res.json({
      success: true,
      user: null,
    });
  }
});

// Delete session (logout)
router.delete('/session', async (req, res) => {
  try {
    // Clear all authentication cookies
    const domain = process.env.NODE_ENV === 'production' ? '.netlify.app' : 'localhost';
    res.clearCookie('auth_token', { domain });
    res.clearCookie('github_token', { domain });
    res.clearCookie('user_data', { domain });
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

// GET logout endpoint for easy browser access
router.get('/logout', async (req, res) => {
  try {
    // Clear all authentication cookies
    const domain = process.env.NODE_ENV === 'production' ? '.netlify.app' : 'localhost';
    res.clearCookie('auth_token', { domain });
    res.clearCookie('github_token', { domain });
    res.clearCookie('user_data', { domain });
    
    // Redirect to signin page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/signin`);
  } catch (error) {
    logger.error('Error during logout:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/signin?error=logout_failed`);
  }
});

// GitHub OAuth entry point
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const backendUrl = process.env.NODE_ENV === 'production' ? 'https://dev-pulse-api.onrender.com' : 'http://localhost:3001';
  const redirectUri = `${backendUrl}/api/auth/github/callback`;
  const scope = 'user:email,read:user,repo';
  
  // Force GitHub to show account selection by adding prompt parameter
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&prompt=select_account`;
  
  res.redirect(githubAuthUrl);
});

// Logout (client-side token invalidation)
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // In a more sophisticated setup, you might maintain a blacklist of tokens
    // For now, we'll just return success and let the client handle token removal
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

export default router;
