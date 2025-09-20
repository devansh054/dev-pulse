import { prisma } from '../app';
import { logger } from '../utils/logger';

export interface BurnoutRiskFactors {
  weeklyHours: number;
  weekendWorkRatio: number;
  commitFrequencyChange: number;
  lateNightCodingTrend: number;
  meetingDensity: number;
  vacationDaysSinceLast: number;
}

export interface ProductivityInsight {
  type: 'productivity' | 'burnout' | 'learning' | 'collaboration';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations: string[];
  data?: any;
}

export class AIInsightsService {
  
  async generateBurnoutPrediction(userId: number): Promise<ProductivityInsight | null> {
    try {
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      const recentMetrics = await prisma.dailyMetric.findMany({
        where: {
          userId,
          date: {
            gte: fourWeeksAgo,
          },
        },
        orderBy: {
          date: 'desc',
        },
      });

      if (recentMetrics.length < 7) {
        return null; // Not enough data
      }

      const riskFactors = this.calculateBurnoutRiskFactors(recentMetrics);
      const riskScore = this.calculateBurnoutRiskScore(riskFactors);

      if (riskScore > 0.6) {
        return {
          type: 'burnout',
          title: 'High Burnout Risk Detected',
          description: `Your burnout risk score is ${Math.round(riskScore * 100)}%. Consider taking preventive measures.`,
          impact: riskScore > 0.8 ? 'high' : 'medium',
          actionable: true,
          recommendations: this.generateBurnoutRecommendations(riskFactors),
          data: { riskScore, riskFactors },
        };
      }

      return null;
    } catch (error) {
      logger.error('Error generating burnout prediction:', error);
      return null;
    }
  }

  async generateProductivityInsights(userId: number): Promise<ProductivityInsight[]> {
    try {
      const insights: ProductivityInsight[] = [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const metrics = await prisma.dailyMetric.findMany({
        where: {
          userId,
          date: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      if (metrics.length < 7) {
        return insights;
      }

      // Peak productivity hours analysis
      const peakHoursInsight = this.analyzePeakProductivityHours(metrics);
      if (peakHoursInsight) insights.push(peakHoursInsight);

      // Commit consistency analysis
      const consistencyInsight = this.analyzeCommitConsistency(metrics);
      if (consistencyInsight) insights.push(consistencyInsight);

      // Weekend work pattern analysis
      const weekendInsight = this.analyzeWeekendWorkPattern(metrics);
      if (weekendInsight) insights.push(weekendInsight);

      // Focus time optimization
      const focusInsight = this.analyzeFocusTimePatterns(metrics);
      if (focusInsight) insights.push(focusInsight);

      return insights;
    } catch (error) {
      logger.error('Error generating productivity insights:', error);
      return [];
    }
  }

  async generateLearningInsights(userId: number): Promise<ProductivityInsight[]> {
    try {
      const insights: ProductivityInsight[] = [];
      
      // Get user's GitHub activity to analyze learning patterns
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { githubUsername: true },
      });

      if (!user?.githubUsername) {
        return insights;
      }

      // Analyze recent activity logs for learning patterns
      const recentActivity = await prisma.activityLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Simple learning pattern detection
      const languageExploration = this.detectLanguageExploration(recentActivity);
      if (languageExploration) insights.push(languageExploration);

      return insights;
    } catch (error) {
      logger.error('Error generating learning insights:', error);
      return [];
    }
  }

  private calculateBurnoutRiskFactors(metrics: any[]): BurnoutRiskFactors {
    const totalHours = metrics.reduce((sum, m) => sum + (m.codingTimeMinutes || 0), 0) / 60;
    const weeklyHours = totalHours / (metrics.length / 7);
    
    const weekendDays = metrics.filter(m => m.weekendWork).length;
    const weekendWorkRatio = weekendDays / metrics.length;
    
    const recentCommits = metrics.slice(0, 7).reduce((sum, m) => sum + m.commitsCount, 0);
    const olderCommits = metrics.slice(7, 14).reduce((sum, m) => sum + m.commitsCount, 0);
    const commitFrequencyChange = olderCommits > 0 ? (recentCommits - olderCommits) / olderCommits : 0;
    
    const lateNightCodingTrend = metrics.reduce((sum, m) => sum + m.lateNightCommits, 0) / metrics.length;
    
    const meetingDensity = metrics.reduce((sum, m) => sum + (m.meetingTimeMinutes || 0), 0) / metrics.length;
    
    // Simplified vacation calculation (would need more data in real implementation)
    const vacationDaysSinceLast = 30; // Placeholder

    return {
      weeklyHours,
      weekendWorkRatio,
      commitFrequencyChange,
      lateNightCodingTrend,
      meetingDensity,
      vacationDaysSinceLast,
    };
  }

  private calculateBurnoutRiskScore(factors: BurnoutRiskFactors): number {
    let score = 0;

    // Weekly hours (weight: 0.3)
    if (factors.weeklyHours > 50) score += 0.3;
    else if (factors.weeklyHours > 40) score += 0.15;

    // Weekend work (weight: 0.2)
    if (factors.weekendWorkRatio > 0.5) score += 0.2;
    else if (factors.weekendWorkRatio > 0.3) score += 0.1;

    // Late night coding (weight: 0.2)
    if (factors.lateNightCodingTrend > 3) score += 0.2;
    else if (factors.lateNightCodingTrend > 1) score += 0.1;

    // Meeting density (weight: 0.15)
    if (factors.meetingDensity > 240) score += 0.15; // 4+ hours of meetings daily
    else if (factors.meetingDensity > 120) score += 0.075;

    // Vacation time (weight: 0.15)
    if (factors.vacationDaysSinceLast > 90) score += 0.15;
    else if (factors.vacationDaysSinceLast > 60) score += 0.075;

    return Math.min(score, 1.0);
  }

  private generateBurnoutRecommendations(factors: BurnoutRiskFactors): string[] {
    const recommendations: string[] = [];

    if (factors.weeklyHours > 45) {
      recommendations.push('Consider reducing weekly coding hours to maintain sustainable pace');
    }

    if (factors.weekendWorkRatio > 0.3) {
      recommendations.push('Try to avoid weekend work to maintain work-life balance');
    }

    if (factors.lateNightCodingTrend > 2) {
      recommendations.push('Establish a consistent sleep schedule and avoid late-night coding');
    }

    if (factors.meetingDensity > 180) {
      recommendations.push('Block dedicated focus time and consider reducing meeting load');
    }

    recommendations.push('Take regular breaks and consider scheduling time off');

    return recommendations;
  }

  private analyzePeakProductivityHours(metrics: any[]): ProductivityInsight | null {
    // Simplified analysis - in real implementation, would analyze hourly data
    const avgCommitsPerDay = metrics.reduce((sum, m) => sum + m.commitsCount, 0) / metrics.length;
    
    if (avgCommitsPerDay > 3) {
      return {
        type: 'productivity',
        title: 'High Productivity Detected',
        description: `You're averaging ${avgCommitsPerDay.toFixed(1)} commits per day. Great consistency!`,
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Maintain this productive rhythm',
          'Consider documenting your successful work patterns',
          'Share your productivity tips with your team'
        ],
      };
    }

    return null;
  }

  private analyzeCommitConsistency(metrics: any[]): ProductivityInsight | null {
    const daysWithCommits = metrics.filter(m => m.commitsCount > 0).length;
    const consistencyRatio = daysWithCommits / metrics.length;

    if (consistencyRatio < 0.3) {
      return {
        type: 'productivity',
        title: 'Inconsistent Coding Pattern',
        description: `You're only coding on ${Math.round(consistencyRatio * 100)}% of days. Consider establishing a more regular routine.`,
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Set a goal to code at least 15 minutes daily',
          'Use habit tracking to build consistency',
          'Start with small, achievable daily goals'
        ],
      };
    }

    return null;
  }

  private analyzeWeekendWorkPattern(metrics: any[]): ProductivityInsight | null {
    const weekendWorkDays = metrics.filter(m => m.weekendWork).length;
    const weekendRatio = weekendWorkDays / metrics.length;

    if (weekendRatio > 0.4) {
      return {
        type: 'burnout',
        title: 'High Weekend Work Activity',
        description: `You're working ${Math.round(weekendRatio * 100)}% of weekends. Consider taking more time off.`,
        impact: 'high',
        actionable: true,
        recommendations: [
          'Designate weekends as code-free time',
          'Plan non-work activities for weekends',
          'Set boundaries between work and personal time'
        ],
      };
    }

    return null;
  }

  private analyzeFocusTimePatterns(metrics: any[]): ProductivityInsight | null {
    const avgFocusTime = metrics.reduce((sum, m) => sum + (m.focusTimeMinutes || 0), 0) / metrics.length;
    
    if (avgFocusTime < 60) { // Less than 1 hour of focus time per day
      return {
        type: 'productivity',
        title: 'Limited Deep Focus Time',
        description: `You're averaging only ${Math.round(avgFocusTime)} minutes of focus time daily.`,
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Block 2-hour periods for deep work',
          'Use techniques like Pomodoro for focused sessions',
          'Minimize distractions during coding time'
        ],
      };
    }

    return null;
  }

  private detectLanguageExploration(activities: any[]): ProductivityInsight | null {
    // Simple detection of new language/technology exploration
    const repoNames = activities
      .filter(a => a.repoName)
      .map(a => a.repoName)
      .filter((name, index, arr) => arr.indexOf(name) === index);

    if (repoNames.length > 3) {
      return {
        type: 'learning',
        title: 'Active Technology Exploration',
        description: `You've been working across ${repoNames.length} different repositories, showing good learning diversity.`,
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Document your learnings from each project',
          'Consider creating a learning journal',
          'Share insights with the developer community'
        ],
      };
    }

    return null;
  }

  async storeInsight(userId: number, insight: ProductivityInsight): Promise<void> {
    try {
      await prisma.insight.create({
        data: {
          userId,
          type: insight.type,
          title: insight.title,
          description: insight.description,
          impact: insight.impact,
          actionable: insight.actionable,
          data: insight.data || {},
        },
      });
    } catch (error) {
      logger.error('Error storing insight:', error);
    }
  }
}
