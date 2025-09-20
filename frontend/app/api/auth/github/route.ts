import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check if GitHub OAuth is properly configured
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.NEXTAUTH_URL) {
    console.log('GitHub OAuth not configured, redirecting to signin')
    return NextResponse.redirect(new URL('/auth/signin?error=oauth_not_configured', request.url))
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }

  if (!code) {
    // Redirect to GitHub OAuth
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/github`
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user user:email repo`
    return NextResponse.redirect(githubAuthUrl)
  }

  try {
    // Exchange code for access token
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/github`
    console.log('OAuth Debug:', {
      redirectUri,
      clientId: process.env.GITHUB_CLIENT_ID,
      code: code?.substring(0, 10) + '...'
    })
    
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()
    console.log('Token response:', { 
      status: tokenResponse.status,
      hasError: !!tokenData.error,
      hasToken: !!tokenData.access_token,
      tokenType: tokenData.token_type,
      scope: tokenData.scope,
      fullToken: tokenData.access_token,
      fullTokenData: tokenData
    })

    if (tokenData.error) {
      console.error('GitHub token error:', tokenData.error)
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }

    // Get user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    const userData = await userResponse.json()
    console.log('User data received:', { 
      status: userResponse.status,
      hasUser: !!userData.id,
      login: userData.login,
      tokenUsed: tokenData.access_token?.substring(0, 15) + '...',
      userDataResponse: userData
    })

    if (!userResponse.ok) {
      console.error('GitHub user API error:', userData)
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }

    // Create a simple session (in production, use proper session management)
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    
    // Set cookies with explicit domain for localhost
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Always false for localhost
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      domain: 'localhost'
    }
    
    response.cookies.set('github_token', tokenData.access_token, cookieOptions)
    response.cookies.set('user_data', JSON.stringify(userData), cookieOptions)
    
    // Clear demo mode cookie when user authenticates with GitHub
    response.cookies.delete('demo_mode')

    console.log('Cookies set, demo mode cleared, redirecting to dashboard')
    return response
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }
}
