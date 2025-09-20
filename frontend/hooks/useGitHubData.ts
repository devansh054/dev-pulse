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

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    return response.json()
  }

  const fetchRepositories = async () => {
    try {
      const data = await apiCall('/repositories')
      setRepositories(data.repositories)
    } catch (err) {
      console.error('Failed to fetch repositories:', err)
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
      const data = await apiCall('/stats', { username })
      setStats(data.stats)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setError('Failed to fetch stats')
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)

    try {
      const userStr = localStorage.getItem('devpulse_user')
      if (!userStr) {
        throw new Error('No user data found')
      }

      const user = JSON.parse(userStr)
      const username = user.login || user.username || user.githubUsername

      if (!username) {
        throw new Error('No GitHub username found')
      }

      await Promise.all([
        fetchRepositories(),
        fetchActivities(username),
        fetchStats(username)
      ])
    } catch (err) {
      console.error('Failed to fetch GitHub data:', err)
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
