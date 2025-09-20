import express from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../app';
import { logger } from '../utils/logger';

const router = express.Router();

// Get user goals
router.get('/goals', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { status, category } = req.query;
    
    const whereClause: any = {
      userId: req.user!.id,
    };

    if (status === 'completed') {
      whereClause.completed = true;
    } else if (status === 'active') {
      whereClause.completed = false;
    }

    if (category) {
      whereClause.category = category;
    }

    const goals = await prisma.goal.findMany({
      where: whereClause,
      orderBy: [
        { completed: 'asc' },
        { priority: 'desc' },
        { targetDate: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: goals.map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        progress: Math.round((goal.currentValue / goal.targetValue) * 100),
        current: goal.currentValue,
        target: goal.targetValue,
        unit: goal.unit,
        targetDate: goal.targetDate.toISOString(),
        completed: goal.completed,
        priority: goal.priority,
        createdAt: goal.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    logger.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goals',
    });
  }
});

// Create new goal
router.post('/goals', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, category, targetValue, unit, targetDate, priority = 'medium' } = req.body;

    if (!title || !category || !targetValue || !unit || !targetDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, category, targetValue, unit, targetDate',
      });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: req.user!.id,
        title,
        description,
        category,
        targetValue: parseInt(targetValue),
        unit,
        targetDate: new Date(targetDate),
        priority,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        progress: 0,
        current: goal.currentValue,
        target: goal.targetValue,
        unit: goal.unit,
        targetDate: goal.targetDate.toISOString(),
        completed: goal.completed,
        priority: goal.priority,
        createdAt: goal.createdAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create goal',
    });
  }
});

// Update goal
router.put('/goals/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const goalId = parseInt(req.params.id);
    const { title, description, targetValue, targetDate, priority, completed } = req.body;

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: req.user!.id,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(targetValue && { targetValue: parseInt(targetValue) }),
        ...(targetDate && { targetDate: new Date(targetDate) }),
        ...(priority && { priority }),
        ...(completed !== undefined && { completed }),
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: {
        id: updatedGoal.id,
        title: updatedGoal.title,
        description: updatedGoal.description,
        category: updatedGoal.category,
        progress: Math.round((updatedGoal.currentValue / updatedGoal.targetValue) * 100),
        current: updatedGoal.currentValue,
        target: updatedGoal.targetValue,
        unit: updatedGoal.unit,
        targetDate: updatedGoal.targetDate.toISOString(),
        completed: updatedGoal.completed,
        priority: updatedGoal.priority,
        updatedAt: updatedGoal.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error updating goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update goal',
    });
  }
});

// Delete goal
router.delete('/goals/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const goalId = parseInt(req.params.id);

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: req.user!.id,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    await prisma.goal.delete({
      where: { id: goalId },
    });

    res.json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete goal',
    });
  }
});

// Get user insights
router.get('/insights', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { type, unread } = req.query;
    
    const whereClause: any = {
      userId: req.user!.id,
    };

    if (type) {
      whereClause.type = type;
    }

    if (unread === 'true') {
      whereClause.isRead = false;
    }

    const insights = await prisma.insight.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    res.json({
      success: true,
      data: insights.map(insight => ({
        id: insight.id,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        impact: insight.impact,
        actionable: insight.actionable,
        data: insight.data,
        isRead: insight.isRead,
        createdAt: insight.createdAt.toISOString(),
        expiresAt: insight.expiresAt?.toISOString(),
      })),
    });
  } catch (error) {
    logger.error('Error fetching insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insights',
    });
  }
});

// Mark insight as read
router.patch('/insights/:id/read', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const insightId = parseInt(req.params.id);

    const existingInsight = await prisma.insight.findFirst({
      where: {
        id: insightId,
        userId: req.user!.id,
      },
    });

    if (!existingInsight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found',
      });
    }

    await prisma.insight.update({
      where: { id: insightId },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'Insight marked as read',
    });
  } catch (error) {
    logger.error('Error marking insight as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark insight as read',
    });
  }
});

// Get activity log
router.get('/activity', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { type, limit = 50 } = req.query;
    
    const whereClause: any = {
      userId: req.user!.id,
    };

    if (type) {
      whereClause.type = type;
    }

    const activities = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        metadata: activity.metadata,
        repoName: activity.repoName,
        createdAt: activity.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    logger.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity',
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get aggregated metrics
    const metrics = await prisma.dailyMetric.aggregate({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      _sum: {
        commitsCount: true,
        prsOpened: true,
        prsReviewed: true,
        issuesClosed: true,
        linesAdded: true,
        linesRemoved: true,
        codingTimeMinutes: true,
        focusTimeMinutes: true,
      },
      _avg: {
        productivityScore: true,
        stressLevel: true,
      },
      _count: {
        id: true,
      },
    });

    // Get goal completion rate
    const totalGoals = await prisma.goal.count({
      where: { userId },
    });

    const completedGoals = await prisma.goal.count({
      where: { userId, completed: true },
    });

    const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    // Get most productive day of week
    const dayOfWeekStats = await prisma.$queryRaw`
      SELECT 
        EXTRACT(DOW FROM date) as day_of_week,
        AVG(commits_count) as avg_commits,
        AVG(coding_time_minutes) as avg_coding_time
      FROM daily_metrics 
      WHERE user_id = ${userId} AND date >= ${startDate}
      GROUP BY EXTRACT(DOW FROM date)
      ORDER BY avg_commits DESC
      LIMIT 1
    ` as any[];

    const mostProductiveDay = dayOfWeekStats.length > 0 ? 
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeekStats[0].day_of_week] : 
      'N/A';

    const stats = {
      period: `${days} days`,
      totalCommits: metrics._sum.commitsCount || 0,
      totalPRs: metrics._sum.prsOpened || 0,
      totalReviews: metrics._sum.prsReviewed || 0,
      totalIssues: metrics._sum.issuesClosed || 0,
      totalLinesAdded: metrics._sum.linesAdded || 0,
      totalLinesRemoved: metrics._sum.linesRemoved || 0,
      totalCodingHours: Math.round((metrics._sum.codingTimeMinutes || 0) / 60),
      totalFocusHours: Math.round((metrics._sum.focusTimeMinutes || 0) / 60),
      avgProductivityScore: Math.round((metrics._avg.productivityScore || 0) * 100) / 100,
      avgStressLevel: Math.round((metrics._avg.stressLevel || 0) * 100) / 100,
      activeDays: metrics._count.id || 0,
      goalCompletionRate: Math.round(goalCompletionRate),
      mostProductiveDay,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics',
    });
  }
});

export default router;
