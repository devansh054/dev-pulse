import express from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { AIInsightsService } from '../services/aiInsightsService';
import { prisma } from '../app';
import { logger } from '../utils/logger';

const router = express.Router();
const aiInsightsService = new AIInsightsService();

// Generate AI insights for user
router.post('/generate', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const insights = [];

    // Generate burnout prediction
    const burnoutInsight = await aiInsightsService.generateBurnoutPrediction(userId);
    if (burnoutInsight) {
      await aiInsightsService.storeInsight(userId, burnoutInsight);
      insights.push(burnoutInsight);
    }

    // Generate productivity insights
    const productivityInsights = await aiInsightsService.generateProductivityInsights(userId);
    for (const insight of productivityInsights) {
      await aiInsightsService.storeInsight(userId, insight);
      insights.push(insight);
    }

    // Generate learning insights
    const learningInsights = await aiInsightsService.generateLearningInsights(userId);
    for (const insight of learningInsights) {
      await aiInsightsService.storeInsight(userId, insight);
      insights.push(insight);
    }

    res.json({
      success: true,
      message: `Generated ${insights.length} new insights`,
      data: insights,
    });
  } catch (error) {
    logger.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
    });
  }
});

// Get burnout risk assessment
router.get('/burnout-risk', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const burnoutInsight = await aiInsightsService.generateBurnoutPrediction(userId);

    if (!burnoutInsight) {
      return res.json({
        success: true,
        data: {
          riskLevel: 'LOW',
          message: 'Not enough data or low risk detected',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        riskLevel: burnoutInsight.impact.toUpperCase(),
        insight: burnoutInsight,
      },
    });
  } catch (error) {
    logger.error('Error assessing burnout risk:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to assess burnout risk',
    });
  }
});

// Get productivity recommendations
router.get('/recommendations', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { type } = req.query;

    let insights = [];

    if (!type || type === 'productivity') {
      const productivityInsights = await aiInsightsService.generateProductivityInsights(userId);
      insights.push(...productivityInsights);
    }

    if (!type || type === 'learning') {
      const learningInsights = await aiInsightsService.generateLearningInsights(userId);
      insights.push(...learningInsights);
    }

    // Get recent stored insights as well
    const storedInsights = await prisma.insight.findMany({
      where: {
        userId,
        ...(type && { type: type as string }),
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    const allRecommendations = [
      ...insights,
      ...storedInsights.map(insight => ({
        type: insight.type,
        title: insight.title,
        description: insight.description,
        impact: insight.impact,
        actionable: insight.actionable,
        recommendations: [], // Would extract from data field in real implementation
        data: insight.data,
      })),
    ];

    res.json({
      success: true,
      data: allRecommendations,
    });
  } catch (error) {
    logger.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
    });
  }
});

export default router;
