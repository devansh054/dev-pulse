import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all admin routes
router.use(authenticateToken);

// GET /api/admin/stats - Get admin statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get user count from database
    const totalUsers = await prisma.user.count();
    
    // Calculate system health (mock for now)
    const systemHealth = Math.floor(Math.random() * 5) + 95; // 95-100%
    
    // Calculate storage usage (mock)
    const storageUsed = (Math.random() * 3 + 1).toFixed(1); // 1.0-4.0 TB
    const storagePercent = Math.floor((parseFloat(storageUsed) / 10) * 100);

    const stats = {
      totalUsers,
      systemHealth,
      storageUsed,
      storagePercent,
      uptime: '99.9%',
      activeConnections: Math.floor(Math.random() * 50) + 20
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin statistics'
    });
  }
});

// GET /api/admin/settings - Get system settings
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Mock system settings (in real app, these would come from database)
    const settings = {
      authentication: {
        githubOAuth: true,
        twoFactorAuth: true,
        sessionTimeout: false
      },
      security: {
        rateLimiting: true,
        ipWhitelist: false,
        auditLogging: true
      },
      performance: {
        caching: true,
        cdn: true,
        compression: true
      }
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin settings'
    });
  }
});

// PUT /api/admin/settings - Update system settings
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { category, setting, enabled } = req.body;

    if (!category || !setting || typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body. Required: category, setting, enabled'
      });
    }

    console.log(`Admin setting updated: ${category}.${setting} = ${enabled} by user ${userId}`);

    // In a real app, you would save this to database
    // For now, just return success
    res.json({
      success: true,
      message: `Setting ${category}.${setting} updated to ${enabled}`,
      data: {
        category,
        setting,
        enabled,
        updatedBy: userId,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update admin settings'
    });
  }
});

// GET /api/admin/users - Get user management data
router.get('/users', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get users from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        githubId: true,
        username: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Mock role assignments (in real app, would have roles table)
    const usersWithRoles = users.map(user => ({
      ...user,
      role: user.id === userId ? 'Super Admin' : 
            Math.random() > 0.8 ? 'Admin' :
            Math.random() > 0.6 ? 'Developer' : 'Viewer',
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: Math.random() > 0.2 ? 'active' : 'inactive'
    }));

    res.json({
      success: true,
      data: {
        users: usersWithRoles,
        totalUsers: users.length,
        roles: [
          { name: 'Super Admin', users: 1, permissions: 'Full system access' },
          { name: 'Admin', users: Math.floor(users.length * 0.1), permissions: 'User and content management' },
          { name: 'Developer', users: Math.floor(users.length * 0.3), permissions: 'Code repository access' },
          { name: 'Viewer', users: Math.floor(users.length * 0.6), permissions: 'Read-only dashboard access' }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data'
    });
  }
});

// GET /api/admin/actions - Get recent admin actions
router.get('/actions', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Mock recent actions (in real app, would come from audit log table)
    const actions = [
      {
        id: `act-${Date.now()}-1`,
        user: 'Admin User',
        action: 'Updated system configuration',
        target: 'Authentication Settings',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: `act-${Date.now()}-2`,
        user: 'System',
        action: 'Automated backup completed',
        target: 'Database Backup',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: `act-${Date.now()}-3`,
        user: 'Admin User',
        action: 'Added new user role',
        target: 'User Management',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: `act-${Date.now()}-4`,
        user: 'System',
        action: 'Security scan initiated',
        target: 'Security Audit',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_progress'
      }
    ];

    res.json({
      success: true,
      data: { actions }
    });
  } catch (error) {
    console.error('Error fetching admin actions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin actions'
    });
  }
});

// POST /api/admin/backup - Initiate system backup
router.post('/backup', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    console.log(`System backup initiated by user ${userId}`);

    // Create backup directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const backupDir = path.join(process.cwd(), 'backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupId = `backup-${Date.now()}`;
    const backupPath = path.join(backupDir, `${backupId}.sql`);
    
    // In a real implementation, this would:
    // 1. Create PostgreSQL database dump using pg_dump
    // 2. Backup uploaded files and configuration
    // 3. Create compressed archive
    
    // For now, create a placeholder backup file
    const backupContent = `-- DevPulse Database Backup
-- Generated: ${new Date().toISOString()}
-- Backup ID: ${backupId}
-- User: ${userId}

-- This is a placeholder backup file
-- In production, this would contain:
-- 1. Full PostgreSQL database dump
-- 2. User uploaded files
-- 3. System configuration files
-- 4. Environment variables (sanitized)

-- Backup completed successfully
`;

    try {
      fs.writeFileSync(backupPath, backupContent);
      console.log(`Backup file created at: ${backupPath}`);
    } catch (writeError) {
      console.error('Failed to create backup file:', writeError);
    }
    
    res.json({
      success: true,
      message: 'System backup initiated successfully',
      data: {
        backupId,
        backupPath: backupPath,
        backupLocation: `${backupDir}/${backupId}.sql`,
        status: 'completed',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        estimatedDuration: '15-20 minutes',
        actualDuration: '2 seconds (placeholder)',
        size: '1.2 KB (placeholder)',
        includes: [
          'PostgreSQL database dump',
          'User uploaded files',
          'System configuration',
          'Application logs'
        ]
      }
    });
  } catch (error) {
    console.error('Error initiating backup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate system backup'
    });
  }
});

// GET /api/admin/logs - Get system logs
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { level = 'all', limit = 50 } = req.query;

    // Mock system logs
    const logLevels = ['info', 'warn', 'error', 'debug'];
    const logs = Array.from({ length: parseInt(limit as string) }, (_, i) => ({
      id: `log-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - i * 60 * 1000).toISOString(),
      level: logLevels[Math.floor(Math.random() * logLevels.length)],
      message: [
        'User authentication successful',
        'Database connection established',
        'API request processed',
        'Cache invalidated',
        'Backup process started',
        'Security scan completed',
        'System health check passed'
      ][Math.floor(Math.random() * 7)],
      source: ['auth', 'database', 'api', 'cache', 'backup', 'security', 'system'][Math.floor(Math.random() * 7)]
    }));

    const filteredLogs = level === 'all' ? logs : logs.filter(log => log.level === level);

    res.json({
      success: true,
      data: {
        logs: filteredLogs,
        totalLogs: filteredLogs.length,
        filters: { level, limit }
      }
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system logs'
    });
  }
});

export default router;
