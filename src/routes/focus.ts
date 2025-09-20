import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Types
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    githubId: string;
    username: string;
    email: string;
  };
}

// In-memory storage for active focus sessions (use Redis in production)
const activeSessions = new Map<string, {
  userId: string;
  startTime: Date;
  sessionId: string;
}>();

// Start focus session
router.post('/start', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Check if user already has an active session
    const existingSession = Array.from(activeSessions.values()).find(session => session.userId === userId);
    if (existingSession) {
      return res.json({
        success: true,
        data: {
          sessionId: existingSession.sessionId,
          startTime: existingSession.startTime.toISOString(),
          message: 'Session already active'
        }
      });
    }

    // Create new session
    const sessionId = `focus-${userId}-${Date.now()}`;
    const startTime = new Date();

    activeSessions.set(sessionId, {
      userId,
      startTime,
      sessionId
    });

    logger.info(`Focus session started for user ${userId}`, { sessionId });

    res.json({
      success: true,
      data: {
        sessionId,
        startTime: startTime.toISOString()
      }
    });
  } catch (error) {
    logger.error('Error starting focus session:', error);
    res.status(500).json({ success: false, message: 'Failed to start focus session' });
  }
});

// End focus session
router.post('/end', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.body;

    if (!userId || !sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: sessionId' 
      });
    }

    const session = activeSessions.get(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Focus session not found'
      });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000 / 60); // minutes

    // Remove from active sessions
    activeSessions.delete(sessionId);

    // Save to database - update today's metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await (prisma as any).dailyMetric.upsert({
      where: {
        userId_date: {
          userId: parseInt(userId),
          date: today
        }
      },
      update: {
        focusTimeMinutes: {
          increment: duration
        },
        updatedAt: new Date()
      },
      create: {
        userId: parseInt(userId),
        date: today,
        focusTimeMinutes: duration,
        commitsCount: 0,
        prsOpened: 0,
        prsReviewed: 0,
        issuesClosed: 0,
        linesAdded: 0,
        linesRemoved: 0,
        codingTimeMinutes: 0,
        meetingTimeMinutes: 0,
        lateNightCommits: 0,
        weekendWork: false
      }
    });

    logger.info(`Focus session ended for user ${userId}`, { sessionId, duration });

    res.json({
      success: true,
      data: {
        sessionId,
        duration,
        endTime: endTime.toISOString()
      }
    });
  } catch (error) {
    logger.error('Error ending focus session:', error);
    res.status(500).json({ success: false, message: 'Failed to end focus session' });
  }
});

// Get focus stats
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Get today's focus time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMetric = await (prisma as any).dailyMetric.findUnique({
      where: {
        userId_date: {
          userId: parseInt(userId),
          date: today
        }
      }
    });

    // Get weekly average
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const weeklyMetrics = await (prisma as any).dailyMetric.findMany({
      where: {
        userId: parseInt(userId),
        date: {
          gte: weekAgo
        }
      }
    });

    const weeklyAverage = weeklyMetrics.length > 0 
      ? Math.round(weeklyMetrics.reduce((sum: number, metric: any) => sum + (metric.focusTimeMinutes || 0), 0) / weeklyMetrics.length)
      : 0;

    // Check for active session
    const activeSession = Array.from(activeSessions.values()).find(session => session.userId === userId);

    res.json({
      success: true,
      data: {
        todayMinutes: todayMetric?.focusTimeMinutes || 0,
        weeklyAverage,
        currentSession: activeSession ? {
          id: activeSession.sessionId,
          startTime: activeSession.startTime.toISOString(),
          isActive: true
        } : null
      }
    });
  } catch (error) {
    logger.error('Error fetching focus stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch focus stats' });
  }
});

export default router;
