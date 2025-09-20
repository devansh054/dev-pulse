"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

function ProtectedRouteContent({ children, fallback }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (isLoading) return // Still loading

    // Check if demo mode is requested via URL parameter
    const isDemoMode = searchParams.get('demo') === 'true'
    
    if (!user && !isDemoMode) {
      router.push("/auth/signin")
    }
  }, [user, isLoading, router, searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    // Allow access in demo mode even without authentication
    const isDemoMode = searchParams.get('demo') === 'true'
    if (!isDemoMode) {
      return fallback || null
    }
  }

  return <>{children}</>
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <ProtectedRouteContent children={children} fallback={fallback} />
    </Suspense>
  )
}
