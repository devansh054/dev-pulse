import express, { Router } from 'express';
import { prisma } from '../app';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

// In-memory store for last scan times (in production, this would be in database)
const userLastScanTimes = new Map<string, Date>();

const router = Router();

// Get security overview stats
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Calculate security score based on various factors
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get user's devices
    const devices = await prisma.device.findMany({
      where: { userId }
    });

    // Mock security calculations for now
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status === 'online').length;
    const vulnerabilityCount = Math.floor(Math.random() * 5); // Random for demo
    const securityScore = Math.max(70, 100 - (vulnerabilityCount * 10) - (totalDevices - onlineDevices) * 5);
    
    // Get actual last scan time for this user, or default to 24 hours ago
    const lastScanTime = userLastScanTimes.get(userId.toString()) || new Date(Date.now() - 86400000); // 24 hours ago as default
    
    const stats = {
      securityScore,
      vulnerabilityCount,
      lastScanTime,
      totalDevices,
      securedDevices: onlineDevices,
      criticalIssues: vulnerabilityCount > 3 ? 1 : 0,
      warningIssues: Math.floor(vulnerabilityCount / 2),
      infoIssues: vulnerabilityCount
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Error fetching security stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch security statistics' });
  }
});

// Get security events
router.get('/events', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Generate mock security events based on user activity
    const events = [
      {
        id: `sec-${userId}-001`,
        type: 'authentication',
        severity: 'info',
        title: 'Successful Login',
        description: 'User authenticated via GitHub OAuth',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        location: 'GitHub OAuth',
        resolved: true
      },
      {
        id: `sec-${userId}-002`,
        type: 'scan',
        severity: 'info',
        title: 'Security Scan Completed',
        description: 'Automated security audit finished successfully',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        location: 'DevPulse Scanner',
        resolved: true
      },
      {
        id: `sec-${userId}-003`,
        type: 'vulnerability',
        severity: 'warning',
        title: 'Dependency Update Available',
        description: 'Security update available for project dependencies',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        location: 'Package Scanner',
        resolved: false
      }
    ];

    res.json({ success: true, data: events });
  } catch (error) {
    logger.error('Error fetching security events:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch security events' });
  }
});

// Get vulnerabilities
router.get('/vulnerabilities', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Mock vulnerability data - in real implementation, this would scan dependencies
    const vulnerabilities = [
      {
        id: `vuln-${userId}-001`,
        package: 'lodash',
        version: '4.17.20',
        severity: 'medium',
        cve: 'CVE-2021-23337',
        description: 'Command injection vulnerability in lodash',
        fixVersion: '4.17.21',
        publishedDate: '2021-02-15',
        discoveredDate: new Date().toISOString()
      },
      {
        id: `vuln-${userId}-002`,
        package: 'axios',
        version: '0.21.0',
        severity: 'low',
        cve: 'CVE-2021-3749',
        description: 'Regular expression denial of service',
        fixVersion: '0.21.4',
        publishedDate: '2021-08-31',
        discoveredDate: new Date().toISOString()
      }
    ];

    res.json({ success: true, data: vulnerabilities });
  } catch (error) {
    logger.error('Error fetching vulnerabilities:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch vulnerabilities' });
  }
});

// Start security scan
router.post('/scan', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Mock scan initiation
    const scanId = `scan-${userId}-${Date.now()}`;
    
    // Update the last scan time for this user
    userLastScanTimes.set(userId.toString(), new Date());
    
    logger.info(`Security scan initiated for user ${userId}`, { scanId });
    
    // In real implementation, this would trigger actual security scanning
    setTimeout(() => {
      logger.info(`Security scan completed for user ${userId}`, { scanId });
    }, 5000);

    res.json({ 
      success: true, 
      data: { 
        scanId,
        status: 'initiated',
        estimatedDuration: '2-5 minutes',
        message: 'Security scan started successfully'
      }
    });
  } catch (error) {
    logger.error('Error starting security scan:', error);
    res.status(500).json({ success: false, error: 'Failed to start security scan' });
  }
});

// Get scan status
router.get('/scan/:scanId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { scanId } = req.params;
    
    // Mock scan status
    const status = {
      scanId,
      status: 'completed',
      progress: 100,
      startTime: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      endTime: new Date().toISOString(),
      findings: {
        critical: 0,
        high: 0,
        medium: 1,
        low: 1,
        info: 2
      }
    };

    res.json({ success: true, data: status });
  } catch (error) {
    logger.error('Error fetching scan status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scan status' });
  }
});

// Get security settings
router.get('/settings', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Get user's security settings from database or return defaults
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Default security settings
    const settings = {
      scanFrequency: 'weekly', // daily, weekly, monthly
      vulnerabilityNotifications: true,
      criticalAlertsOnly: false,
      autoUpdateDependencies: false,
      scanOnCommit: true,
      emailNotifications: true,
      slackIntegration: false,
      excludedPaths: [
        'node_modules',
        '.git',
        'dist',
        'build'
      ],
      scanTypes: {
        dependencies: true,
        secrets: true,
        codeQuality: true,
        licenses: true
      }
    };

    res.json({ success: true, data: settings });
  } catch (error) {
    logger.error('Error fetching security settings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch security settings' });
  }
});

// Update security settings
router.put('/settings', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const settings = req.body;
    
    // Validate settings structure
    const allowedFrequencies = ['daily', 'weekly', 'monthly'];
    if (settings.scanFrequency && !allowedFrequencies.includes(settings.scanFrequency)) {
      return res.status(400).json({ success: false, error: 'Invalid scan frequency' });
    }

    logger.info(`Security settings updated for user ${userId}`, { settings });
    
    // In a real implementation, you would save these to the database
    // For now, we'll just acknowledge the update
    
    res.json({ 
      success: true, 
      data: { 
        message: 'Security settings updated successfully',
        settings
      }
    });
  } catch (error) {
    logger.error('Error updating security settings:', error);
    res.status(500).json({ success: false, error: 'Failed to update security settings' });
  }
});

export default router;
