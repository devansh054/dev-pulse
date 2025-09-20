'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SimpleAuthProps {
  onSuccess: (token: string, user: any) => void
}

export function SimpleAuth({ onSuccess }: SimpleAuthProps) {
  const [githubToken, setGithubToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTokenAuth = async () => {
    if (!githubToken.trim()) {
      setError('Please enter your GitHub token')
      return
    }

    setLoading(true)
    setError('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/simple-auth/github-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ githubToken })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('devpulse_token', data.token)
        localStorage.setItem('devpulse_user', JSON.stringify(data.user))
        localStorage.setItem('github_token', githubToken)
        onSuccess(data.token, data.user)
      } else {
        setError(data.error || 'Authentication failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoAuth = async () => {
    setLoading(true)
    setError('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/simple-auth/demo-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('devpulse_token', data.token)
        localStorage.setItem('devpulse_user', JSON.stringify(data.user))
        onSuccess(data.token, data.user)
      } else {
        setError(data.error || 'Demo authentication failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>GitHub Token Authentication</CardTitle>
          <CardDescription>
            Enter your GitHub Personal Access Token to authenticate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Create a token at{' '}
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                github.com/settings/tokens
              </a>
            </p>
          </div>
          <Button 
            onClick={handleTokenAuth} 
            disabled={loading || !githubToken.trim()}
            className="w-full"
          >
            {loading ? 'Authenticating...' : 'Authenticate with Token'}
          </Button>
        </CardContent>
      </Card>

      <div className="text-center">
        <span className="text-sm text-muted-foreground">or</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demo Mode</CardTitle>
          <CardDescription>
            Try DevPulse with a demo account (no GitHub required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleDemoAuth} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Creating Demo...' : 'Continue with Demo'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
