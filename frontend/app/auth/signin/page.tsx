"use client"

import { useState } from 'react';
import { Github, Activity, Shield, BarChart3, Users, Zap, Code2, Star } from 'lucide-react';
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGitHubSignIn = () => {
    setIsLoading(true)
    window.location.href = 'http://localhost:3001/api/auth/github'
  }

  const handleDemoMode = async () => {
    console.log('Demo mode clicked')
    // Clear any existing authentication
    try {
      const response = await fetch('http://localhost:3001/api/auth/session', { 
        method: 'DELETE',
        credentials: 'include'
      })
      console.log('Logout response:', response.status)
    } catch (error) {
      console.log('No existing session to clear:', error)
    }
    
    // Clear specific auth cookies but preserve others
    document.cookie = "github_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Set demo mode cookie to allow dashboard access
    document.cookie = "demo_mode=true; path=/; max-age=86400"; // 24 hours
    
    console.log('Navigating to dashboard')
    router.push('/dashboard?demo=true')
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-center px-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Logo size="lg" />
            <span className="text-2xl font-bold">DevPulse</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Your development insights, <span className="text-gray-300">powered by AI</span>
          </h1>
          
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Connect your GitHub account to unlock personalized insights about your coding patterns, 
            health metrics, and team collaboration.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-400" />
              <span className="text-gray-300">Real-time developer health monitoring</span>
            </div>
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-blue-400" />
              <span className="text-gray-300">Deep GitHub analytics and insights</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-400" />
              <span className="text-gray-300">Team collaboration optimization</span>
            </div>
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-blue-400" />
              <span className="text-gray-300">AI-powered recommendations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-12">
        <div className="max-w-md mx-auto w-full">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Logo size="md" />
              <span className="text-xl font-bold">DevPulse</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to your DevPulse account to continue</p>
          </div>

          {/* GitHub Sign In */}
          <div className="space-y-4">
            <button
              onClick={handleGitHubSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Github className="h-5 w-5" />
              )}
              {isLoading ? 'Connecting...' : 'Continue with GitHub'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button 
              onClick={handleDemoMode}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Activity className="h-5 w-5" />
              Try Demo Mode
            </button>
          </div>

          {/* Permissions info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">What we'll access:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your public profile information</li>
              <li>• Repository metadata and commit history</li>
              <li>• Pull request and issue activity</li>
              <li>• Collaboration patterns (no code content)</li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              We never access your private code content, only metadata for analytics.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{' '}
              <a href="#" className="text-black hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-black hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
