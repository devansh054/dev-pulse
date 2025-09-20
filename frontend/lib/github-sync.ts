import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

interface GitHubUser {
  id: number
  login: string
  name: string
  email: string
  avatar_url: string
  bio: string
  company: string
  location: string
  public_repos: number
  followers: number
  following: number
  created_at: string
}

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  private: boolean
  language: string
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
  pushed_at: string
}

export class GitHubSyncService {
  private static async getAccessToken(): Promise<string | null> {
    const session = await getServerSession(authOptions)
    // In a real implementation, you'd store and retrieve the GitHub access token
    // For now, we'll use the environment variable as a fallback
    return process.env.GITHUB_ACCESS_TOKEN || null
  }

  static async syncUserProfile(userId: string): Promise<GitHubUser | null> {
    try {
      const token = await this.getAccessToken()
      if (!token) return null

      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const userData = await response.json()
      
      // Store user data in database
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          githubData: userData,
        }),
      })

      if (!backendResponse.ok) {
        console.error('Failed to sync user data to backend')
      }

      return userData
    } catch (error) {
      console.error('Error syncing GitHub user profile:', error)
      return null
    }
  }

  static async syncUserRepositories(userId: string): Promise<GitHubRepo[]> {
    try {
      const token = await this.getAccessToken()
      if (!token) return []

      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const repos = await response.json()
      
      // Store repository data in database
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/sync-repos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          repositories: repos,
        }),
      })

      if (!backendResponse.ok) {
        console.error('Failed to sync repository data to backend')
      }

      return repos
    } catch (error) {
      console.error('Error syncing GitHub repositories:', error)
      return []
    }
  }

  static async getCommitActivity(userId: string, repo: string): Promise<any[]> {
    try {
      const token = await this.getAccessToken()
      if (!token) return []

      const session = await getServerSession(authOptions)
      const username = session?.user?.name // This should be the GitHub username

      const response = await fetch(`https://api.github.com/repos/${username}/${repo}/commits?per_page=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching commit activity:', error)
      return []
    }
  }

  static async triggerFullSync(userId: string): Promise<boolean> {
    try {
      // Sync user profile
      await this.syncUserProfile(userId)
      
      // Sync repositories
      await this.syncUserRepositories(userId)
      
      // Trigger backend analytics update
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/trigger-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      })

      return backendResponse.ok
    } catch (error) {
      console.error('Error during full sync:', error)
      return false
    }
  }
}
