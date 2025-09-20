'use client'

import { useState, useEffect } from 'react'

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  language: string
  stars: number
  forks: number
  updated_at: string
  created_at: string
  private: boolean
  html_url: string
}

interface Activity {
  id: string
  type: string
  repo: string
  created_at: string
  payload: {
    action?: string
    commits?: number
    ref?: string
    ref_type?: string
  }
}

interface Stats {
  totalRepositories: number
  totalStars: number
  totalForks: number
  publicRepos: number
  privateRepos: number
  topLanguages: { language: string; count: number }[]
}

export function useGitHubData() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiCall = async (endpoint: string, params?: Record<string, string>) => {
    const token = localStorage.getItem('devpulse_token')
    console.log('useGitHubData: Retrieved token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null')
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const url = new URL(`${apiUrl}/api/github-data${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    console.log('useGitHubData: Making API call to:', url.toString())
    console.log('useGitHubData: With headers:', { 'Authorization': `Bearer ${token.substring(0, 20)}...` })

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('useGitHubData: API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('useGitHubData: API error response:', errorText)
      throw new Error(`API call failed: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('useGitHubData: API response data:', data)
    return data
  }

  const fetchRepositories = async () => {
    try {
      console.log('useGitHubData: Fetching repositories...')
      const data = await apiCall('/repositories')
      console.log('useGitHubData: Repositories response:', data)
      setRepositories(data.repositories)
    } catch (err) {
      console.error('useGitHubData: Failed to fetch repositories:', err)
      setError('Failed to fetch repositories')
    }
  }

  const fetchActivities = async (username: string) => {
    try {
      const data = await apiCall('/activity', { username })
      setActivities(data.activities)
    } catch (err) {
      console.error('Failed to fetch activities:', err)
      setError('Failed to fetch activities')
    }
  }

  const fetchStats = async (username: string) => {
    try {
      console.log('useGitHubData: Fetching stats for username:', username)
      const data = await apiCall('/stats', { username })
      console.log('useGitHubData: Stats response:', data)
      setStats(data.stats)
    } catch (err) {
      console.error('useGitHubData: Failed to fetch stats:', err)
      setError('Failed to fetch stats')
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)

    try {
      const userStr = localStorage.getItem('devpulse_user')
      const token = localStorage.getItem('devpulse_token')
      
      console.log('useGitHubData: Checking localStorage...')
      console.log('useGitHubData: User data:', userStr)
      console.log('useGitHubData: Token exists:', !!token)

      if (!userStr || !token) {
        console.log('useGitHubData: No user data or token found, skipping API calls')
        setLoading(false)
        return
      }

      const user = JSON.parse(userStr)
      console.log('useGitHubData: Parsed user:', user)
      
      if (user.id === 'demo-user') {
        console.log('useGitHubData: Demo user detected, skipping API calls')
        setLoading(false)
        return
      }

      const username = user.login || user.username || user.githubUsername
      console.log('useGitHubData: Using username:', username)

      if (!username) {
        throw new Error('No GitHub username found')
      }

      console.log('useGitHubData: Starting API calls...')
      await Promise.all([
        fetchRepositories(),
        fetchActivities(username),
        fetchStats(username)
      ])
      console.log('useGitHubData: API calls completed')
    } catch (err) {
      console.error('useGitHubData: Failed to fetch GitHub data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  return {
    repositories,
    activities,
    stats,
    loading,
    error,
    refetch: fetchAllData
  }
}
