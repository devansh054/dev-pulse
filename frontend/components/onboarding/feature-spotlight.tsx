"use client"

import { useState, useEffect } from "react"
import { X, Lightbulb, TrendingUp, Users, Brain, Target, Calendar } from "lucide-react"

interface FeatureSpotlight {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  action?: {
    label: string
    onClick: () => void
  }
}

const weeklySpotlights: FeatureSpotlight[] = [
  {
    id: 'ai-insights',
    title: 'AI Insights Just Got Smarter',
    description: 'Our AI now detects burnout patterns 3 days earlier and provides personalized recovery recommendations.',
    icon: <Brain className="h-5 w-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    action: {
      label: 'View AI Insights',
      onClick: () => {
        const element = document.querySelector('[data-tour="ai-insights-card"]')
        element?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  },
  {
    id: 'productivity-trends',
    title: 'New Productivity Trends',
    description: 'Track your coding velocity, focus time patterns, and identify your most productive hours of the day.',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    action: {
      label: 'See Trends',
      onClick: () => {
        const element = document.querySelector('[data-tour="productivity-chart"]')
        element?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  },
  {
    id: 'team-collaboration',
    title: 'Enhanced Team Analytics',
    description: 'New collaboration metrics help identify knowledge silos and optimize code review processes.',
    icon: <Users className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    action: {
      label: 'View Team Stats',
      onClick: () => {
        const element = document.querySelector('[data-tour="team-ranking"]')
        element?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }
]

interface FeatureSpotlightProps {
  isVisible: boolean
  onDismiss: () => void
}

export default function FeatureSpotlight({ isVisible, onDismiss }: FeatureSpotlightProps) {
  const [currentSpotlight, setCurrentSpotlight] = useState<FeatureSpotlight | null>(null)

  useEffect(() => {
    if (!isVisible) return

    // Rotate through spotlights weekly
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
    const spotlightIndex = weekNumber % weeklySpotlights.length
    setCurrentSpotlight(weeklySpotlights[spotlightIndex])
  }, [isVisible])

  if (!isVisible || !currentSpotlight) return null

  return (
    <div className={`${currentSpotlight.bgColor} border rounded-lg p-4 mb-6 relative`}>
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start gap-4 pr-8">
        <div className={`p-2 ${currentSpotlight.bgColor} rounded-lg ${currentSpotlight.color}`}>
          <Lightbulb className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1 ${currentSpotlight.bgColor} rounded ${currentSpotlight.color}`}>
              {currentSpotlight.icon}
            </div>
            <h3 className="font-semibold text-gray-900">
              {currentSpotlight.title}
            </h3>
          </div>
          
          <p className="text-gray-700 text-sm mb-3 leading-relaxed">
            {currentSpotlight.description}
          </p>
          
          {currentSpotlight.action && (
            <button
              onClick={currentSpotlight.action.onClick}
              className={`inline-flex items-center gap-2 px-3 py-2 ${currentSpotlight.color} bg-white text-sm font-medium rounded-md border hover:bg-gray-50 transition-colors`}
            >
              {currentSpotlight.action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
