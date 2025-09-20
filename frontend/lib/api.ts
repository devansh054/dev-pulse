import { DashboardStat, RebelRanking, SecurityStatus, Notification } from '@/types/dashboard'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// API client with cookie-based authentication
class ApiClient {
  private baseURL = API_BASE_URL;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    console.log(`🌐 API Request: ${url}`, config);
    const response = await fetch(url, config)
    console.log(`📡 API Response: ${response.status}`, response);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.log('🔐 Authentication required, redirecting to GitHub OAuth');
        // Redirect to GitHub OAuth on authentication failure
        window.location.href = 'http://localhost:3001/api/auth/github'
        throw new Error('Authentication required')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`📦 API Data:`, data);
    return data
  }

  // Authentication
  async githubCallback(code: string) {
    return this.request<{ success: boolean; token: string; user: any }>('/auth/github/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async getCurrentUser() {
    return this.request<{ success: boolean; user: any }>('/auth/me')
  }

  // Dashboard data
  async getDashboardOverview() {
    return this.request<{
      success: boolean
      data: {
        metrics: any
        activity: any[]
        goals: any[]
        recentActivity: any[]
      }
    }>('/dashboard')
  }

  async getProductivityTrends(period: 'week' | 'month' | 'year' = 'week') {
    return this.request<{
      success: boolean
      data: {
        period: string
        trends: Array<{
          date: string
          commits: number
          focusTime: number
          productivity: number
        }>
      }
    }>(`/dashboard/trends?period=${period}`)
  }

  async getTeamDashboard() {
    return this.request<{
      success: boolean
      data: {
        teamMetrics: any
        teamMembers: any[]
        teamActivity: any[]
      }
    }>('/dashboard/team')
  }

  // GitHub integration
  async getGitHubStats() {
    return this.request<{
      success: boolean
      data: {
        totalCommits: number
        totalRepos: number
        contributionStreak: number
        languageStats: Record<string, number>
      }
    }>('/github/stats')
  }

  async getGitHubRepositories() {
    return this.request('/github/repositories');
  }

  async syncGitHubData() {
    return this.request<{ success: boolean; message: string }>('/github/sync', {
      method: 'POST',
    })
  }

  // User management
  async getUserGoals() {
    return this.request<{
      success: boolean
      data: {
        goals: Array<{
          id: string
          title: string
          description: string
          target: number
          current: number
          deadline: string
          status: string
        }>
      }
    }>('/user/goals')
  }

  async getUserInsights() {
    return this.request<{
      success: boolean
      data: {
        insights: Array<{
          id: string
          type: string
          title: string
          description: string
          recommendations: string[]
          createdAt: string
          read: boolean
        }>
      }
    }>('/user/insights')
  }

  async getUserStats() {
    return this.request<{
      success: boolean
      data: {
        totalCommits: number
        totalRepos: number
        contributionStreak: number
        averageFocusTime: number
        productivityScore: number
      }
    }>('/user/stats')
  }

  // AI Insights
  async generateAIInsights() {
    return this.request<{
      success: boolean
      data: {
        insights: Array<{
          type: string
          title: string
          description: string
          recommendations: string[]
        }>
      }
    }>('/insights/generate', {
      method: 'POST',
    })
  }

  async getBurnoutRisk() {
    return this.request<{
      success: boolean
      data: {
        riskLevel: 'low' | 'medium' | 'high'
        score: number
        factors: string[]
        recommendations: string[]
      }
    }>('/insights/burnout-risk')
  }

  async getProductivityRecommendations() {
    return this.request<{
      success: boolean
      data: {
        recommendations: Array<{
          type: string
          title: string
          description: string
          impact: 'low' | 'medium' | 'high'
        }>
      }
    }>('/insights/recommendations')
  }

  // AI-powered insights
  async getAIInsights(userId: string) {
    return this.request<{
      success: boolean
      data: Array<{
        id: string
        title: string
        description: string
        type: 'productivity' | 'code_quality' | 'collaboration' | 'performance'
        priority: 'high' | 'medium' | 'low'
        actionable: boolean
        timestamp: string
      }>
    }>(`/ai/insights/${userId}`)
  }

  async getAIHealthScore(userId: string) {
    return this.request<{
      success: boolean
      data: {
        score: number
        factors: Array<{
          name: string
          score: number
          status: 'excellent' | 'good' | 'needs_improvement'
        }>
        recommendations: string[]
        timestamp: string
      }
    }>(`/ai/health-score/${userId}`)
  }

  async getCodeSuggestions(code: string) {
    return this.request<{
      success: boolean
      data: {
        suggestions: string[]
        timestamp: string
      }
    }>('/ai/code-suggestions', {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  }

  // Chat API methods
  async getChatConversations() {
    return this.request('/chat/conversations');
  }

  async sendChatMessage(content: string, receiverId: string) {
    return this.request('/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, receiverId })
    });
  }

  async getConversationMessages(partnerId: string) {
    return this.request(`/chat/conversations/${partnerId}/messages`);
  }

  async updateUserAvatar(avatar: string) {
    return this.request('/chat/profile/avatar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar })
    });
  }

  async getOnlineUsers() {
    return this.request('/chat/users/online');
  }

  // Team management
  async getTeamMembers() {
    return this.request<{
      success: boolean
      data: {
        teamMembers: Array<{
          id: number
          name: string
          githubUsername: string
          avatar: string
          bio: string | null
          location: string | null
          publicRepos: number
          followers: number
          following: number
          joinedAt: string
          commits: number
          pullRequests: number
          issues: number
        }>
      }
    }>('/team/members')
  }

  async addTeamMember(githubUsername: string) {
    return this.request<{
      success: boolean
      data: {
        member: any
      }
    }>('/team/members', {
      method: 'POST',
      body: JSON.stringify({ githubUsername })
    })
  }

  async removeTeamMember(memberId: number) {
    return this.request<{
      success: boolean
      data: {
        deletedMember: any
      }
    }>(`/team/members/${memberId}`, {
      method: 'DELETE'
    })
  }

  // Focus time tracking
  async startFocusSession() {
    return this.request<{
      success: boolean
      data: {
        sessionId: string
        startTime: string
      }
    }>('/focus/start', {
      method: 'POST'
    })
  }

  async endFocusSession(sessionId: string) {
    return this.request<{
      success: boolean
      data: {
        sessionId: string
        duration: number
        endTime: string
      }
    }>('/focus/end', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    })
  }

  async getFocusStats() {
    return this.request<{
      success: boolean
      data: {
        todayMinutes: number
        weeklyAverage: number
        currentSession: {
          id: string
          startTime: string
          isActive: boolean
        } | null
      }
    }>('/focus/stats')
  }

  async removeChatUser(userId: string) {
    return this.request<{
      success: boolean
      data: {
        removedUser: string
        removedMessages: number
      }
    }>(`/chat/remove-user/${userId}`, {
      method: 'DELETE'
    })
  }

  // Laboratory API methods
  async getLaboratoryStats() {
    return this.request<{
      success: boolean
      data: {
        activeExperiments: number
        totalExperiments: number
        testCoverage: number
        performanceTests: number
        pendingExperiments: number
        completedExperiments: number
      }
    }>('/laboratory/stats')
  }

  async getExperiments() {
    return this.request<{
      success: boolean
      data: {
        experiments: Array<{
          id: number
          name: string
          description?: string
          type: string
          status: string
          progress: number
          priority: string
          startDate?: string
          endDate?: string
          estimatedDuration?: number
          actualDuration?: number
          tags: string[]
          configuration?: any
          results?: any
          notes?: string
          createdAt: string
          updatedAt: string
          benchmarks: Array<{
            id: number
            name: string
            metric: string
            value: number
            unit: string
            baseline?: number
            improvement?: number
            timestamp: string
          }>
          testRuns: Array<{
            id: number
            runNumber: number
            status: string
            startTime: string
            endTime?: string
            duration?: number
            testsPassed: number
            testsFailed: number
            testsSkipped: number
            coverage?: number
          }>
        }>
      }
    }>('/laboratory/experiments')
  }

  async createExperiment(data: {
    name: string
    description?: string
    type: string
    priority?: string
    estimatedDuration?: number
    tags?: string[]
    configuration?: any
  }) {
    return this.request<{
      success: boolean
      data: { experiment: any }
    }>('/laboratory/experiments', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateExperiment(id: number, data: any) {
    return this.request<{
      success: boolean
      data: { experiment: any }
    }>(`/laboratory/experiments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async startExperiment(id: number) {
    return this.request<{
      success: boolean
      data: { experiment: any }
    }>(`/laboratory/experiments/${id}/start`, {
      method: 'POST'
    })
  }

  async completeExperiment(id: number, data?: { results?: any; notes?: string }) {
    return this.request<{
      success: boolean
      data: { experiment: any }
    }>(`/laboratory/experiments/${id}/complete`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async deleteExperiment(id: number) {
    return this.request<{
      success: boolean
      data: { message: string }
    }>(`/laboratory/experiments/${id}`, {
      method: 'DELETE'
    })
  }

  async addBenchmark(experimentId: number, data: {
    name: string
    metric: string
    value: number
    unit: string
    baseline?: number
    metadata?: any
  }) {
    return this.request<{
      success: boolean
      data: { benchmark: any }
    }>(`/laboratory/experiments/${experimentId}/benchmarks`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Devices API methods
  async getDevices() {
    return this.request<{
      success: boolean
      data: {
        devices: Array<{
          id: string
          name: string
          type: string
          status: 'online' | 'offline' | 'maintenance'
          lastSeen: string
          specs?: {
            cpu?: string
            memory?: string
            storage?: string
            os?: string
          }
          avgCpuUsage?: number
          averageMemoryUsage?: number
          storageUsage?: number
        }>
      }
    }>('/devices')
  }

  async getDeviceStats() {
    return this.request<{
      success: boolean
      data: {
        totalDevices: number
        onlineDevices: number
        offlineDevices: number
        avgCpuUsage: number
        averageMemoryUsage: number
        totalMemoryUsage: number
      }
    }>('/devices/stats')
  }

  async addDevice(data: {
    name: string
    type: string
    location?: string
    version?: string
  }) {
    return this.request<{
      success: boolean
      data: { device: any }
    }>('/devices', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateDevice(id: string, data: {
    name?: string
    type?: string
    location?: string
    version?: string
    status?: 'online' | 'offline' | 'maintenance'
  }) {
    return this.request<{
      success: boolean
      data: { device: any }
    }>(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteDevice(id: string) {
    return this.request<{
      success: boolean
      data: { message: string }
    }>(`/devices/${id}`, {
      method: 'DELETE'
    })
  }

  // Security API methods
  async getSecurityStats() {
    return this.request<{
      success: boolean
      data: {
        securityScore: number
        vulnerabilityCount: number
        lastScanTime: string
        totalDevices: number
        securedDevices: number
        criticalIssues: number
        warningIssues: number
        infoIssues: number
      }
    }>('/security/stats')
  }

  async getSecurityEvents() {
    return this.request<{
      success: boolean
      data: Array<{
        id: string
        type: string
        severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
        title: string
        description: string
        timestamp: string
        location: string
        resolved: boolean
      }>
    }>('/security/events')
  }

  async getVulnerabilities() {
    return this.request<{
      success: boolean
      data: Array<{
        id: string
        package: string
        version: string
        severity: 'critical' | 'high' | 'medium' | 'low'
        cve: string
        description: string
        fixVersion: string
        publishedDate: string
        discoveredDate: string
      }>
    }>('/security/vulnerabilities')
  }

  async startSecurityScan() {
    return this.request<{
      success: boolean
      data: {
        scanId: string
        status: string
        estimatedDuration: string
        message: string
      }
    }>('/security/scan', {
      method: 'POST'
    })
  }

  async getSecurityScanStatus(scanId: string) {
    return this.request<{
      success: boolean
      data: {
        scanId: string
        status: string
        progress: number
        startTime: string
        endTime?: string
        findings: {
          critical: number
          high: number
          medium: number
          low: number
          info: number
        }
      }
    }>(`/security/scan/${scanId}`)
  }

  async getSecuritySettings() {
    return this.request<{
      success: boolean
      data: {
        scanFrequency: 'daily' | 'weekly' | 'monthly'
        vulnerabilityNotifications: boolean
        criticalAlertsOnly: boolean
        autoUpdateDependencies: boolean
        scanOnCommit: boolean
        emailNotifications: boolean
        slackIntegration: boolean
        excludedPaths: string[]
        scanTypes: {
          dependencies: boolean
          secrets: boolean
          codeQuality: boolean
          licenses: boolean
        }
      }
    }>('/security/settings')
  }

  async updateSecuritySettings(settings: any) {
    return this.request<{
      success: boolean
      data: {
        message: string
        settings: any
      }
    }>('/security/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  async getDeviceHealth() {
    return this.request<{
      success: boolean
      data: {
        overallHealth: 'healthy' | 'warning' | 'critical'
        healthScore: number
        criticalIssues: Array<{
          deviceId: string
          deviceName: string
          issue: string
          severity: 'critical' | 'warning'
          timestamp: string
        }>
        recommendations: string[]
      }
    }>('/devices/health')
  }

  async reportDeviceMetrics(deviceId: string, data: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkUsage: number
    temperature?: number
  }) {
    return this.request<{
      success: boolean
      data: { message: string }
    }>(`/devices/${deviceId}/metrics`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

export const apiClient = new ApiClient()

import { GearIcon, BoomIcon } from '@/components/icons';

// Data transformation utilities
export const transformToDashboardStats = (data: any): DashboardStat[] => {
  if (!data) return []
  
  return [
    {
      label: 'FOCUS TIME TODAY',
      value: `${data.focusTime || 0}h`,
      description: 'DEEP WORK SESSIONS',
      intent: 'positive' as const,
      icon: GearIcon,
      direction: 'up' as const,
    },
    {
      label: 'COMMITS TODAY',
      value: `${data.commitsToday || 0}`,
      description: 'CODE CONTRIBUTIONS',
      intent: 'positive' as const,
      icon: GearIcon,
      direction: 'up' as const,
    },
    {
      label: 'PRODUCTIVITY SCORE',
      value: `${data.productivityScore || 0}%`,
      description: 'OVERALL PERFORMANCE',
      intent: data.productivityScore >= 80 ? 'positive' : data.productivityScore >= 60 ? 'neutral' : 'negative',
      icon: BoomIcon,
      tag: data.productivityScore >= 90 ? 'EXCELLENT 🚀' : undefined,
    },
  ]
}

export const transformToRebelRanking = (teamMembers: any[]): RebelRanking[] => {
  if (!teamMembers) return []
  
  return teamMembers.map((member, index) => ({
    id: member.id || index + 1,
    name: member.name?.toUpperCase() || member.username?.toUpperCase() || 'UNKNOWN',
    handle: `@${member.githubUsername || member.username || 'user'}`,
    streak: `${member.commits + member.pullRequests + member.issues || 0} contributions`,
    points: member.commits + member.pullRequests + member.issues || 0,
    avatar: member.avatar || member.avatarUrl || `/avatars/default.png`,
    featured: index === 0,
    subtitle: index === 0 ? `Top Contributor • ${member.publicRepos || 0} repos` : undefined,
  }))
}

export const transformToSecurityStatus = (data: any): SecurityStatus[] => {
  if (!data) return []
  
  return [
    {
      title: 'CODE QUALITY',
      value: `${data.codeQuality || 0}%`,
      status: '[ANALYSIS]',
      variant: data.codeQuality >= 90 ? 'success' : data.codeQuality >= 70 ? 'warning' : 'destructive',
    },
    {
      title: 'BUILD STATUS',
      value: data.buildStatus || 'UNKNOWN',
      status: '[LATEST BUILD]',
      variant: data.buildStatus === 'PASSING' ? 'success' : 'warning',
    },
    {
      title: 'ACTIVITY LEVEL',
      value: data.activityLevel || 'NORMAL',
      status: '[CURRENT WEEK]',
      variant: 'success',
    },
  ]
}

export const transformChartData = (trends: any[]) => {
  console.log('🔄 Transforming trends data:', trends);
  if (!trends || !Array.isArray(trends)) {
    console.log('⚠️ No trends data or not an array, returning empty array');
    return []
  }
  
  const transformed = trends.map(trend => {
    const result = {
      date: trend.date,
      spendings: Math.max(trend.focusTime || 0, 10), // Minimum value for visibility
      sales: Math.max((trend.commits || 0) * 1000, 10),
      coffee: Math.max((trend.score || 0) * 10, 10),
    };
    console.log('🔄 Transformed trend:', trend, '→', result);
    return result;
  });
  
  console.log('✅ Final transformed data:', transformed);
  return transformed;
}

// Communications API helper functions
export const communicationsApi = {
  getCommunicationStats: () => fetch(`${API_BASE_URL}/communications/stats`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()),

  getCommunicationChannels: () => fetch(`${API_BASE_URL}/communications/channels`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()),

  getCommunicationMessages: () => fetch(`${API_BASE_URL}/communications/messages`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()),

  createCommunicationChannel: (channelData: {
    name: string;
    type: 'public' | 'private';
    description?: string;
  }) => fetch(`${API_BASE_URL}/communications/channels`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(channelData)
  }).then(res => res.json()),

  sendMessage: (messageData: {
    channelId: string;
    message: string;
  }) => fetch(`${API_BASE_URL}/communications/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageData)
  }).then(res => res.json()),

  getCommunicationAnalytics: () => fetch(`${API_BASE_URL}/communications/analytics`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json())
};

// Admin API helper functions
export const adminApi = {
  getAdminStats: () => fetch(`${API_BASE_URL}/admin/stats`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()),

  getAdminSettings: () => fetch(`${API_BASE_URL}/admin/settings`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()),

  updateAdminSetting: (settingData: {
    category: string;
    setting: string;
    enabled: boolean;
  }) => fetch(`${API_BASE_URL}/admin/settings`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingData)
  }).then(res => res.json()),

  getAdminUsers: () => fetch(`${API_BASE_URL}/admin/users`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()),

  getAdminActions: () => fetch(`${API_BASE_URL}/admin/actions`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()),

  initiateBackup: () => fetch(`${API_BASE_URL}/admin/backup`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()),

  getSystemLogs: (params?: {
    level?: string;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.level) queryParams.append('level', params.level);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return fetch(`${API_BASE_URL}/admin/logs?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json());
  }
};
