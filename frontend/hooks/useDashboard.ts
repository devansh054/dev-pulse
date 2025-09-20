'use client'

import { useState, useEffect } from 'react'
import { apiClient, transformToDashboardStats, transformToRebelRanking, transformToSecurityStatus, transformChartData } from '@/lib/api'
import { DashboardStat, RebelRanking, SecurityStatus, ChartDataPoint } from '@/types/dashboard'

export function useDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStat[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [teamRanking, setTeamRanking] = useState<RebelRanking[]>([])
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch dashboard overview
      const dashboardResponse = await apiClient.getDashboardOverview()
      if (dashboardResponse.success) {
        const stats = transformToDashboardStats(dashboardResponse.data.metrics)
        setDashboardStats(stats)
      }

      // Fetch productivity trends
      const trendsResponse = await apiClient.getProductivityTrends('week')
      if (trendsResponse.success) {
        const chartData = transformChartData(trendsResponse.data.trends)
        setChartData(chartData)
      }

      // Fetch team dashboard
      const teamResponse = await apiClient.getTeamDashboard()
      if (teamResponse.success) {
        const ranking = transformToRebelRanking(teamResponse.data.teamMembers)
        setTeamRanking(ranking)
        
        const security = transformToSecurityStatus(teamResponse.data.teamMetrics)
        setSecurityStatus(security)
      }

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchDashboardData()
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    dashboardStats,
    chartData,
    teamRanking,
    securityStatus,
    loading,
    error,
    refreshData,
  }
}

export function useGitHubStats() {
  const [stats, setStats] = useState<any>(null)
  const [repositories, setRepositories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGitHubData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsResponse, reposResponse] = await Promise.all([
        apiClient.getGitHubStats(),
        apiClient.getGitHubRepositories(),
      ])

      if (statsResponse.success) {
        setStats(statsResponse.data)
      }

      if (reposResponse.success) {
        setRepositories(reposResponse.data.repositories)
      }

    } catch (err) {
      console.error('Failed to fetch GitHub data:', err)
      setError('Failed to load GitHub data')
    } finally {
      setLoading(false)
    }
  }

  const syncData = async () => {
    try {
      await apiClient.syncGitHubData()
      await fetchGitHubData()
    } catch (err) {
      console.error('Failed to sync GitHub data:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchGitHubData()
  }, [])

  return {
    stats,
    repositories,
    loading,
    error,
    syncData,
    refreshData: fetchGitHubData,
  }
}

export function useAIInsights() {
  const [insights, setInsights] = useState<any[]>([])
  const [burnoutRisk, setBurnoutRisk] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)

      const [insightsResponse, burnoutResponse, recommendationsResponse] = await Promise.all([
        apiClient.getUserInsights(),
        apiClient.getBurnoutRisk(),
        apiClient.getProductivityRecommendations(),
      ])

      if (insightsResponse.success) {
        setInsights(insightsResponse.data.insights)
      }

      if (burnoutResponse.success) {
        setBurnoutRisk(burnoutResponse.data)
      }

      if (recommendationsResponse.success) {
        setRecommendations(recommendationsResponse.data.recommendations)
      }

    } catch (err) {
      console.error('Failed to fetch AI insights:', err)
      setError('Failed to load AI insights')
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = async () => {
    try {
      await apiClient.generateAIInsights()
      await fetchInsights()
    } catch (err) {
      console.error('Failed to generate insights:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  return {
    insights,
    burnoutRisk,
    recommendations,
    loading,
    error,
    generateInsights,
    refreshData: fetchInsights,
  }
}
