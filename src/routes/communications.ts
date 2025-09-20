import express from 'express';
import { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../app';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/communications/stats - Get communication statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get user's devices to calculate communication stats
    const devices = await prisma.device.findMany({
      where: { userId: parseInt(userId) }
    });

    // Mock communication stats based on user data
    const totalDevices = devices.length;
    const activeChannels = Math.max(3, Math.floor(totalDevices * 1.5));
    const messagesToday = Math.floor(Math.random() * 300) + 150;
    const avgResponseTime = (Math.random() * 8 + 2).toFixed(1); // 2-10 minutes

    const stats = {
      activeChannels,
      messagesToday,
      avgResponseTime: `${avgResponseTime}m`,
      totalMembers: Math.floor(activeChannels * 6.5),
      unreadMessages: Math.floor(Math.random() * 15),
      onlineMembers: Math.floor(Math.random() * 8) + 3
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching communication stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch communication statistics'
    });
  }
});

// GET /api/communications/channels - Get communication channels
router.get('/channels', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    // Get user info and GitHub token for real data
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { username: true, name: true }
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
        error: 'GitHub token not found'
      });
    }

    try {
      // Import GitHubService
      const { GitHubService } = await import('../services/githubService');
      const githubService = new GitHubService(githubToken);
      
      // Get user's real repositories
      const repositories = await githubService.getUserRepositories(user.username, 10);
      
      // Create channels based on actual repositories
      const repoChannels = repositories.slice(0, 4).map((repo, index) => ({
        id: `ch-repo-${repo.id}`,
        name: `#${repo.name}`,
        type: repo.isPrivate ? "private" : "public",
        members: Math.max(1, (repo.forks || 0) + Math.floor(Math.random() * 5)),
        lastMessage: repo.description || `Working on ${repo.name}`,
        lastActivity: repo.updatedAt && new Date(repo.updatedAt).toLocaleDateString() === new Date().toLocaleDateString() 
          ? "Today" 
          : repo.updatedAt 
            ? `${Math.floor((Date.now() - new Date(repo.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago`
            : "Unknown",
        unread: (repo.openIssues || 0) > 0 ? Math.min(repo.openIssues || 0, 10) : 0,
        status: (repo.openIssues || 0) > 5 ? "active" : "quiet",
        description: repo.description || `Repository: ${repo.name}`,
        language: repo.language,
        stars: repo.stars,
        forks: repo.forks,
        openIssues: repo.openIssues,
        htmlUrl: repo.htmlUrl
      }));

      // If user has fewer than 4 repos, add some general channels
      const baseChannels = repoChannels.length < 4 ? [
        ...repoChannels,
        {
          id: "ch-general",
          name: "#general",
          type: "public",
          members: 1,
          lastMessage: "Welcome to your communication hub!",
          lastActivity: "Now",
          unread: 0,
          status: "active",
          description: "General discussions"
        }
      ] : repoChannels;

      res.json({
        success: true,
        data: { channels: baseChannels }
      });
    } catch (githubError) {
      console.error('Error fetching GitHub data:', githubError);
      // Fallback to basic channel if GitHub API fails
      res.json({
        success: true,
        data: { 
          channels: [{
            id: "ch-general",
            name: "#general",
            type: "public",
            members: 1,
            lastMessage: "Welcome to your communication hub!",
            lastActivity: "Now",
            unread: 0,
            status: "active",
            description: "General discussions"
          }]
        }
      });
    }
  } catch (error) {
    console.error('Error in channels endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch communication channels'
    });
  }
});

// GET /api/communications/messages - Get recent messages
router.get('/messages', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    // Get user info for personalized messages
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { username: true, name: true, avatarUrl: true }
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
        error: 'GitHub token not found'
      });
    }

    try {
      // Import GitHubService
      const { GitHubService } = await import('../services/githubService');
      const githubService = new GitHubService(githubToken);
      
      // Get user's real repositories and recent activity
      const repositories = await githubService.getUserRepositories(user.username, 5);
      
      // Get recent commits for each repository
      const recentMessages = [];
      
      for (const repo of repositories.slice(0, 3)) {
        try {
          const commitActivity = await githubService.getCommitActivity(user.username, repo.name, 7);
          
          if (commitActivity.length > 0) {
            const latestCommit = commitActivity[0];
            recentMessages.push({
              id: `msg-commit-${repo.id}`,
              channel: repo.name,
              author: user.name || user.username,
              avatar: user.avatarUrl || `https://github.com/${user.username}.png`,
              message: `Pushed ${latestCommit.commits} commit${latestCommit.commits > 1 ? 's' : ''} to ${repo.name}`,
              timestamp: new Date(latestCommit.date).toLocaleDateString() === new Date().toLocaleDateString() 
                ? "Today" 
                : `${Math.floor((Date.now() - new Date(latestCommit.date).getTime()) / (1000 * 60 * 60 * 24))} days ago`,
              reactions: (repo.stars || 0) > 0 ? ["⭐"] : ["🚀"],
              isOwn: true,
              metadata: {
                repository: repo.name,
                commitCount: latestCommit.commits,
                language: repo.language
              }
            });
          }
        } catch (commitError) {
          // If can't get commits, create a general repo message
          recentMessages.push({
            id: `msg-repo-${repo.id}`,
            channel: repo.name,
            author: user.name || user.username,
            avatar: user.avatarUrl || `https://github.com/${user.username}.png`,
            message: repo.description || `Working on ${repo.name}`,
            timestamp: repo.updatedAt 
              ? `${Math.floor((Date.now() - new Date(repo.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago`
              : "Recently",
            reactions: (repo.stars || 0) > 0 ? ["⭐"] : [],
            isOwn: true,
            metadata: {
              repository: repo.name,
              stars: repo.stars,
              forks: repo.forks,
              language: repo.language
            }
          });
        }
      }

      // If no messages from repos, add a welcome message
      const messages = recentMessages.length > 0 ? recentMessages : [
        {
          id: "msg-welcome",
          channel: "general",
          author: user.name || user.username,
          avatar: user.avatarUrl || `https://github.com/${user.username}.png`,
          message: "Welcome to your DevPulse communication hub!",
          timestamp: "Now",
          reactions: [],
          isOwn: true
        }
      ];

      res.json({
        success: true,
        data: { messages }
      });
    } catch (githubError) {
      console.error('Error fetching GitHub messages:', githubError);
      // Fallback to basic message if GitHub API fails
      res.json({
        success: true,
        data: { 
          messages: [{
            id: "msg-welcome",
            channel: "general",
            author: user.name || user.username,
            avatar: user.avatarUrl || `https://github.com/${user.username}.png`,
            message: "Welcome to your DevPulse communication hub!",
            timestamp: "Now",
            reactions: [],
            isOwn: true
          }]
        }
      });
    }
  } catch (error) {
    console.error('Error in messages endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent messages'
    });
  }
});

// POST /api/communications/channels - Create new channel
router.post('/channels', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    const { name, type, description } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Channel name and type are required'
      });
    }

    // Simulate channel creation
    const newChannel = {
      id: `ch-${Date.now()}`,
      name: name.toLowerCase().replace(/\s+/g, '-'),
      type,
      description: description || `${name} channel`,
      members: 1, // Creator only initially
      lastMessage: "Channel created",
      lastActivity: "just now",
      unread: 0,
      status: "active",
      createdBy: userId,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: { channel: newChannel },
      message: 'Channel created successfully'
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create channel'
    });
  }
});

// POST /api/communications/messages - Send message
router.post('/messages', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    const { channelId, message } = req.body;

    if (!channelId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Channel ID and message are required'
      });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { username: true, name: true, avatarUrl: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Simulate message sending
    const newMessage = {
      id: `msg-${Date.now()}`,
      channel: channelId,
      author: user.name || user.username,
      avatar: user.avatarUrl || "/avatars/default.png",
      message,
      timestamp: "just now",
      reactions: [],
      isOwn: true,
      sentAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: { message: newMessage },
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// GET /api/communications/analytics - Get communication analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Generate analytics data
    const analytics = {
      messageVolume: {
        today: Math.floor(Math.random() * 100) + 50,
        thisWeek: Math.floor(Math.random() * 500) + 300,
        thisMonth: Math.floor(Math.random() * 2000) + 1200
      },
      responseMetrics: {
        avgResponseTime: (Math.random() * 10 + 2).toFixed(1) + 'm',
        responseRate: Math.floor(Math.random() * 20) + 80 + '%'
      },
      teamActivity: {
        mostActiveChannel: 'general',
        peakHours: '9:00 AM - 6:00 PM',
        activeMembers: Math.floor(Math.random() * 10) + 5
      },
      engagement: {
        totalReactions: Math.floor(Math.random() * 200) + 100,
        messagesPerDay: Math.floor(Math.random() * 50) + 25,
        threadParticipation: Math.floor(Math.random() * 30) + 60 + '%'
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch communication analytics'
    });
  }
});

// GET /api/communications/channels - Get communication channels
router.get('/channels', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Simulate fetching channels
    const channels = [
      {
        id: 'ch-001',
        name: 'general',
        type: 'public',
        description: 'General channel for all team members',
        members: 10,
        lastMessage: 'Hello, team!',
        lastActivity: '1 hour ago',
        unread: 0,
        status: 'active',
        createdBy: userId,
        createdAt: '2022-01-01T12:00:00.000Z'
      },
      {
        id: 'ch-002',
        name: 'development',
        type: 'private',
        description: 'Development channel for dev team',
        members: 5,
        lastMessage: 'Code review completed',
        lastActivity: '30 minutes ago',
        unread: 0,
        status: 'active',
        createdBy: userId,
        createdAt: '2022-01-05T14:00:00.000Z'
      }
    ];

    res.json({
      success: true,
      data: { channels }
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch communication channels'
    });
  }
});

export default router;
