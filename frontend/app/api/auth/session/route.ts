import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const githubToken = cookieStore.get('github_token')
  const userData = cookieStore.get('user_data')
  const demoMode = cookieStore.get('demo_mode')

  console.log('Session API Debug:', {
    hasGithubToken: !!githubToken,
    hasUserData: !!userData,
    hasDemoMode: !!demoMode,
    githubTokenValue: githubToken?.value?.substring(0, 10) + '...',
    userDataValue: userData?.value?.substring(0, 50) + '...'
  })

  // Check for real authentication first
  if (githubToken && userData) {
    try {
      const user = JSON.parse(userData.value)
      console.log('Session API: Returning authenticated user data:', { 
        id: user.id, 
        login: user.login, 
        name: user.name 
      })
      return NextResponse.json({ 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar_url,
          login: user.login
        }
      })
    } catch (error) {
      console.error('Session API: Error parsing user data:', error)
    }
  }

  // If in demo mode and no real authentication, return a demo user
  if (demoMode?.value === 'true') {
    console.log('Session API: Demo mode active, returning demo user')
    return NextResponse.json({ 
      user: {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@devpulse.com',
        image: 'https://github.com/github.png',
        login: 'demo-user'
      }
    })
  }

  console.log('Session API: No authentication found, returning null user')
  return NextResponse.json({ user: null })
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Logged out' })
  response.cookies.delete('github_token')
  response.cookies.delete('user_data')
  return response
}
