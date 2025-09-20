"use client"

import { useState } from "react"
import { Github, X, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

interface DemoModeBannerProps {
  isDemo: boolean
  onDismiss?: () => void
}

export default function DemoModeBanner({ isDemo, onDismiss }: DemoModeBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isDemo || !isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-blue-400 hover:text-blue-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start gap-4 pr-8">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Sparkles className="h-5 w-5 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">
            You're in Demo Mode
          </h3>
          <p className="text-blue-700 text-sm mb-3 leading-relaxed">
            You're viewing sample data to explore DevPulse features. Connect your GitHub account to unlock personalized insights, real-time analytics, and AI-powered recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/auth/signin">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                <Github className="h-4 w-4" />
                Connect GitHub
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            
            <button
              onClick={handleDismiss}
              className="inline-flex items-center justify-center px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-md border border-blue-200 hover:bg-blue-50 transition-colors"
            >
              Continue Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
