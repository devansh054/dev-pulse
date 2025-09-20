import { logger } from '../utils/logger';

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'productivity' | 'code_quality' | 'collaboration' | 'performance';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  timestamp: Date;
}

export interface CodeAnalysis {
  complexity: number;
  maintainability: string;
  suggestions: string[];
  patterns: string[];
}

export class HuggingFaceService {
  private static readonly API_URL = 'https://api-inference.huggingface.co/models';
  private static readonly API_KEY = process.env.HUGGINGFACE_API_KEY;

  // Model endpoints for different AI tasks
  private static readonly MODELS = {
    TEXT_GENERATION: 'microsoft/DialoGPT-medium',
    SENTIMENT_ANALYSIS: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
    CODE_ANALYSIS: 'microsoft/codebert-base',
    SUMMARIZATION: 'facebook/bart-large-cnn'
  };

  static async generateInsights(githubData: any): Promise<AIInsight[]> {
    try {
      if (!this.API_KEY) {
        logger.warn('Hugging Face API key not found, using mock insights');
        return this.getMockInsights();
      }

      const insights: AIInsight[] = [];

      // Analyze commit patterns
      if (githubData.commits && githubData.commits.length > 0) {
        const commitInsight = await this.analyzeCommitPatterns(githubData.commits);
        if (commitInsight) insights.push(commitInsight);
      }

      // Analyze repository health
      if (githubData.repositories) {
        const repoInsight = await this.analyzeRepositoryHealth(githubData.repositories);
        if (repoInsight) insights.push(repoInsight);
      }

      // Analyze collaboration patterns
      if (githubData.pullRequests) {
        const collabInsight = await this.analyzeCollaboration(githubData.pullRequests);
        if (collabInsight) insights.push(collabInsight);
      }

      return insights.length > 0 ? insights : this.getMockInsights();
    } catch (error) {
      logger.error('Failed to generate AI insights:', error);
      return this.getMockInsights();
    }
  }

  private static async analyzeCommitPatterns(commits: any[]): Promise<AIInsight | null> {
    try {
      const commitMessages = commits.map(c => c.message).join('\n');
      
      const analysis = await this.callHuggingFaceAPI(
        this.MODELS.SENTIMENT_ANALYSIS,
        commitMessages.substring(0, 500) // Limit input size
      );

      const sentiment = analysis?.[0]?.label || 'NEUTRAL';
      
      return {
        id: 'commit-pattern-' + Date.now(),
        title: 'Commit Pattern Analysis',
        description: this.generateCommitInsight(commits.length, sentiment),
        type: 'productivity',
        priority: commits.length > 10 ? 'high' : 'medium',
        actionable: true,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Failed to analyze commit patterns:', error);
      return null;
    }
  }

  private static async analyzeRepositoryHealth(repositories: any[]): Promise<AIInsight | null> {
    try {
      const repoData = repositories.map(r => ({
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        issues: r.open_issues_count || 0,
        language: r.language
      }));

      const totalStars = repoData.reduce((sum, r) => sum + r.stars, 0);
      const totalIssues = repoData.reduce((sum, r) => sum + r.issues, 0);
      const languages = [...new Set(repoData.map(r => r.language).filter(Boolean))];

      return {
        id: 'repo-health-' + Date.now(),
        title: 'Repository Health Score',
        description: `Your ${repositories.length} repositories have ${totalStars} total stars and ${totalIssues} open issues. Primary languages: ${languages.slice(0, 3).join(', ')}.`,
        type: 'code_quality',
        priority: totalIssues > 20 ? 'high' : 'medium',
        actionable: totalIssues > 0,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Failed to analyze repository health:', error);
      return null;
    }
  }

  private static async analyzeCollaboration(pullRequests: any[]): Promise<AIInsight | null> {
    try {
      const prCount = pullRequests.length;
      const mergedPRs = pullRequests.filter(pr => pr.merged_at).length;
      const mergeRate = prCount > 0 ? (mergedPRs / prCount) * 100 : 0;

      return {
        id: 'collaboration-' + Date.now(),
        title: 'Collaboration Insights',
        description: `${mergeRate.toFixed(1)}% PR merge rate with ${prCount} total PRs. ${mergeRate > 80 ? 'Excellent collaboration!' : 'Consider improving PR review process.'}`,
        type: 'collaboration',
        priority: mergeRate < 60 ? 'high' : 'medium',
        actionable: mergeRate < 80,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Failed to analyze collaboration:', error);
      return null;
    }
  }

  private static async callHuggingFaceAPI(model: string, input: string): Promise<any> {
    const response = await fetch(`${this.API_URL}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: input }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    return await response.json();
  }

  private static generateCommitInsight(commitCount: number, sentiment: string): string {
    const frequency = commitCount > 20 ? 'high' : commitCount > 10 ? 'moderate' : 'low';
    const sentimentText = sentiment === 'POSITIVE' ? 'positive' : sentiment === 'NEGATIVE' ? 'concerning' : 'neutral';
    
    return `${frequency} commit frequency (${commitCount} commits) with ${sentimentText} commit message sentiment. ${
      commitCount < 5 ? 'Consider increasing development activity.' : 
      commitCount > 30 ? 'Great development momentum!' : 
      'Steady development pace.'
    }`;
  }

  static async generateCodeSuggestions(codeSnippet: string): Promise<string[]> {
    try {
      if (!this.API_KEY) {
        return this.getMockCodeSuggestions();
      }

      const analysis = await this.callHuggingFaceAPI(
        this.MODELS.TEXT_GENERATION,
        `Analyze this code and suggest improvements: ${codeSnippet.substring(0, 200)}`
      );

      return analysis?.generated_text ? 
        [analysis.generated_text] : 
        this.getMockCodeSuggestions();
    } catch (error) {
      logger.error('Failed to generate code suggestions:', error);
      return this.getMockCodeSuggestions();
    }
  }

  private static getMockInsights(): AIInsight[] {
    return [
      {
        id: 'mock-1',
        title: 'High Development Velocity',
        description: 'Your commit frequency has increased 23% this week. Great momentum on feature development!',
        type: 'productivity',
        priority: 'high',
        actionable: false,
        timestamp: new Date()
      },
      {
        id: 'mock-2',
        title: 'Code Review Optimization',
        description: 'Average PR review time is 2.3 days. Consider setting up automated code quality checks.',
        type: 'collaboration',
        priority: 'medium',
        actionable: true,
        timestamp: new Date()
      },
      {
        id: 'mock-3',
        title: 'Technical Debt Alert',
        description: 'Detected increasing complexity in 3 repositories. Schedule refactoring sessions.',
        type: 'code_quality',
        priority: 'high',
        actionable: true,
        timestamp: new Date()
      }
    ];
  }

  private static getMockCodeSuggestions(): string[] {
    return [
      'Consider extracting complex logic into separate functions',
      'Add error handling for async operations',
      'Implement proper TypeScript types for better code safety',
      'Consider using design patterns for better maintainability'
    ];
  }
}
