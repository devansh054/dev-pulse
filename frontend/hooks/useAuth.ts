'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  avatarUrl?: string | null
  login?: string
  username?: string
  githubUsername?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      // First check localStorage for simple-auth token
      const token = localStorage.getItem('devpulse_token')
      const userStr = localStorage.getItem('devpulse_user')
      
      if (token && userStr) {
        const user = JSON.parse(userStr)
        console.log('useAuth: Found localStorage user:', user)
        setUser(user)
        setIsLoading(false)
        return
      }

      // Fallback to old session check
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/auth/session`, {
        credentials: 'include'
      })
      const data = await response.json()
      console.log('useAuth: Session data received:', data)
      setUser(data.user)
    } catch (error) {
      console.error('Session check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Warm up the backend before OAuth to prevent cold start delays
    try {
      await fetch(`${apiUrl}/api/auth/ping`, { 
        method: 'GET',
        cache: 'no-cache'
      });
      // Small delay to ensure backend is fully warmed up
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.warn('Backend warmup failed, proceeding with OAuth:', error);
    }
    
    window.location.href = `${apiUrl}/api/auth/github`;
  };

  const signOut = async () => {
    try {
      // Clear localStorage tokens
      localStorage.removeItem('devpulse_token')
      localStorage.removeItem('devpulse_user')
      
      // Also clear old session
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      await fetch(`${apiUrl}/api/auth/session`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn: handleGitHubLogin,
    signOut
  }
}
