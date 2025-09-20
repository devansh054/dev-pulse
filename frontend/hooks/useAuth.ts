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
      const response = await fetch('http://localhost:3001/api/auth/session', {
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

  const signIn = () => {
    window.location.href = 'http://localhost:3001/api/auth/github'
  }

  const signOut = async () => {
    try {
      await fetch('http://localhost:3001/api/auth/session', { 
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
    signIn,
    signOut
  }
}
