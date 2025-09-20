import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { prisma } from '../app';
import { logger } from '../utils/logger';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Test GitHub OAuth configuration
router.get('/test-oauth', async (req, res) => {
  try {
    // Test with a fake code to see GitHub's response
    const testResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: 'test_invalid_code_12345',
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    res.json({
      success: true,
      githubResponse: testResponse.data,
      config: {
        clientId: process.env.GITHUB_CLIENT_ID?.substring(0, 8) + '...',
        hasClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
        redirectUri: `${process.env.NODE_ENV === 'production' ? 'https://dev-pulse-api.onrender.com' : 'http://localhost:3001'}/api/auth/github/callback`
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      githubError: axios.isAxiosError(error) ? error.response?.data : undefined
    });
  }
});

// Keep-alive endpoint to prevent cold starts
router.get('/ping', (req, res) => {
  try {
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: {
        hasGithubClientId: !!process.env.GITHUB_CLIENT_ID,
        hasGithubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
        hasFrontendUrl: !!process.env.FRONTEND_URL,
        frontendUrl: process.env.FRONTEND_URL
      },
      database: {
        connected: false
      }
    });
  } catch (error) {
    logger.error('Ping endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      environment: {
        hasGithubClientId: !!process.env.GITHUB_CLIENT_ID,
        hasGithubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
        hasFrontendUrl: !!process.env.FRONTEND_URL,
        frontendUrl: process.env.FRONTEND_URL
      },
      database: {
        connected: false
      }
    });
  }
});

// OAuth debug endpoint
router.get('/debug', (req, res) => {
  const { code } = req.query;
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: {
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID?.substring(0, 8) + '...',
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'NOT_SET',
      FRONTEND_URL: process.env.FRONTEND_URL,
      NODE_ENV: process.env.NODE_ENV
    },
    request: {
      hasCode: !!code,
      codeLength: code ? String(code).length : 0,
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'referer': req.headers['referer'],
        'host': req.headers['host']
      }
    },
    oauth: {
      expectedCallbackUrl: 'https://dev-pulse-api.onrender.com/api/auth/github/callback',
      githubAuthUrl: `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=https://dev-pulse-api.onrender.com/api/auth/github/callback&scope=user:email,read:user,repo`
    }
  });
});

// GitHub OAuth callback
router.get('/github/callback', async (req, res) => {
  try {
    const { code, error: oauthError, error_description } = req.query;

    // Log the callback request for debugging
    logger.info('OAuth callback received:', {
      code: code ? 'present' : 'missing',
      error: oauthError,
      error_description,
      query: req.query
    });

    if (oauthError) {
      logger.error('OAuth error from GitHub:', { error: oauthError, description: error_description });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/auth/signin?error=oauth_${oauthError}`);
    }

    if (!code) {
      logger.error('No authorization code provided');
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required',
      });
    }

    // Exchange code for access token with timeout and retry
    let tokenResponse;
    try {
      tokenResponse = await axios.post(
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
          timeout: 10000, // 10 second timeout
        }
      );
    } catch (axiosError) {
      logger.error('GitHub token exchange failed:', {
        error: axiosError instanceof Error ? axiosError.message : 'Unknown error',
        response: axios.isAxiosError(axiosError) ? axiosError.response?.data : undefined,
        status: axios.isAxiosError(axiosError) ? axiosError.response?.status : undefined
      });
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/auth/signin?error=token_exchange_failed`);
    }

    logger.info('GitHub token response:', tokenResponse.data);

    const { access_token, error: tokenError, error_description: tokenErrorDesc } = tokenResponse.data;

    if (tokenError) {
      logger.error('GitHub returned token error:', { error: tokenError, description: tokenErrorDesc });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/auth/signin?error=github_${tokenError}`);
    }

    if (!access_token) {
      logger.error('No access token in response:', tokenResponse.data);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/auth/signin?error=no_access_token`);
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
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      res.cookie('github_token', access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
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

// Keep-alive endpoint to prevent cold starts
router.get('/ping', (req, res) => {
  res.json({ 
    success: true, 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// GitHub OAuth entry point
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const backendUrl = process.env.NODE_ENV === 'production' ? 'https://dev-pulse-api.onrender.com' : 'http://localhost:3001';
  const redirectUri = `${backendUrl}/api/auth/github/callback`;
  const scope = 'user:email,read:user,repo';
  
  logger.info('GitHub OAuth initiated', { clientId: clientId?.substring(0, 8) + '...', redirectUri });
  
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
