import cron from 'node-cron';
import { prisma } from '../app';
import { GitHubService } from './githubService';
import { AIInsightsService } from './aiInsightsService';
import { logger } from '../utils/logger';

export class CronService {
  private aiInsightsService: AIInsightsService;

  constructor() {
    this.aiInsightsService = new AIInsightsService();
  }

  startScheduledTasks() {
    // Daily GitHub data sync at 6 AM
    cron.schedule('0 6 * * *', async () => {
      logger.info('Starting daily GitHub data sync...');
      await this.syncAllUsersGitHubData();
    });

    // Generate AI insights daily at 8 AM
    cron.schedule('0 8 * * *', async () => {
      logger.info('Starting daily AI insights generation...');
      await this.generateDailyInsights();
    });

    // Weekly burnout assessment on Mondays at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      logger.info('Starting weekly burnout assessment...');
      await this.weeklyBurnoutAssessment();
    });

    // Clean up old insights monthly
    cron.schedule('0 2 1 * *', async () => {
      logger.info('Starting monthly cleanup...');
      await this.cleanupOldData();
    });

    logger.info('Scheduled tasks started successfully');
  }

  private async syncAllUsersGitHubData() {
    try {
      const users = await prisma.user.findMany({
        where: {
          githubId: {
            not: null,
          },
        },
        select: {
          id: true,
          username: true,
          githubId: true,
        },
      });

      logger.info(`Syncing GitHub data for ${users.length} users`);

      for (const user of users) {
        try {
          // Skip GitHub sync for now since we don't store access tokens
          // const githubService = new GitHubService(user.githubAccessToken!);
          // await githubService.syncUserData(user.id, user.username!);
          
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          logger.error(`Failed to sync data for user ${user.id}:`, error);
        }
      }

      logger.info('Daily GitHub sync completed');
    } catch (error) {
      logger.error('Error in daily GitHub sync:', error);
    }
  }

  private async generateDailyInsights() {
    try {
      const users = await prisma.user.findMany({
        select: { id: true },
      });

      logger.info(`Generating insights for ${users.length} users`);

      for (const user of users) {
        try {
          // Generate productivity insights
          const productivityInsights = await this.aiInsightsService.generateProductivityInsights(user.id);
          for (const insight of productivityInsights) {
            await this.aiInsightsService.storeInsight(user.id, insight);
          }

          // Generate learning insights
          const learningInsights = await this.aiInsightsService.generateLearningInsights(user.id);
          for (const insight of learningInsights) {
            await this.aiInsightsService.storeInsight(user.id, insight);
          }

          // Add small delay
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          logger.error(`Failed to generate insights for user ${user.id}:`, error);
        }
      }

      logger.info('Daily insights generation completed');
    } catch (error) {
      logger.error('Error in daily insights generation:', error);
    }
  }

  private async weeklyBurnoutAssessment() {
    try {
      const users = await prisma.user.findMany({
        select: { id: true },
      });

      logger.info(`Running burnout assessment for ${users.length} users`);

      for (const user of users) {
        try {
          const burnoutInsight = await this.aiInsightsService.generateBurnoutPrediction(user.id);
          if (burnoutInsight) {
            await this.aiInsightsService.storeInsight(user.id, burnoutInsight);
            
            // If high risk, could send notification (email, Slack, etc.)
            if (burnoutInsight.impact === 'high') {
              logger.warn(`High burnout risk detected for user ${user.id}`);
              // TODO: Implement notification system
            }
          }

          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          logger.error(`Failed burnout assessment for user ${user.id}:`, error);
        }
      }

      logger.info('Weekly burnout assessment completed');
    } catch (error) {
      logger.error('Error in weekly burnout assessment:', error);
    }
  }

  private async cleanupOldData() {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // Clean up old insights
      const deletedInsights = await prisma.insight.deleteMany({
        where: {
          createdAt: {
            lt: threeMonthsAgo,
          },
          isRead: true,
        },
      });

      // Clean up old activity logs (keep 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const deletedActivities = await prisma.activityLog.deleteMany({
        where: {
          createdAt: {
            lt: sixMonthsAgo,
          },
        },
      });

      logger.info(`Cleanup completed: ${deletedInsights.count} insights, ${deletedActivities.count} activities deleted`);
    } catch (error) {
      logger.error('Error in monthly cleanup:', error);
    }
  }

  // Manual trigger methods for testing
  async triggerGitHubSync() {
    await this.syncAllUsersGitHubData();
  }

  async triggerInsightsGeneration() {
    await this.generateDailyInsights();
  }

  async triggerBurnoutAssessment() {
    await this.weeklyBurnoutAssessment();
  }
}
