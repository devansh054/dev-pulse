"use client"

import { useSearchParams } from "next/navigation"
import { AlertCircle, ArrowLeft, Github } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'You denied access to your GitHub account.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      default:
        return 'An unexpected error occurred during authentication.'
    }
  }

  const getErrorTitle = (error: string | null) => {
    switch (error) {
      case 'AccessDenied':
        return 'Access Denied'
      case 'Configuration':
        return 'Configuration Error'
      case 'Verification':
        return 'Verification Failed'
      default:
        return 'Authentication Error'
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getErrorTitle(error)}
          </h1>
          <p className="text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/auth/signin">
            <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              <Github className="h-5 w-5" />
              Try Again
            </button>
          </Link>
          
          <Link href="/">
            <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </button>
          </Link>
        </div>

        {error === 'AccessDenied' && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Why we need GitHub access:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Analyze your coding patterns and productivity</li>
              <li>• Generate personalized health insights</li>
              <li>• Track repository activity and collaboration</li>
              <li>• Provide AI-powered recommendations</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}
