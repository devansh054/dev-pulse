"use client"

import { useState, useEffect, useRef } from "react"
import { X, ArrowRight, ArrowLeft, Sparkles, Target, Users, Activity, Brain, Calendar } from "lucide-react"

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  icon: React.ReactNode
  position: 'top' | 'bottom' | 'left' | 'right'
  priority: 'high' | 'medium' | 'low'
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to DevPulse! 🚀',
    description: 'Your AI-powered developer intelligence platform. Let\'s take a quick tour of the key features that will transform your development workflow.',
    target: 'dashboard-header',
    icon: <Sparkles className="h-5 w-5" />,
    position: 'bottom',
    priority: 'high'
  },
  {
    id: 'ai-insights',
    title: 'AI-Powered Insights',
    description: 'Get personalized recommendations, burnout predictions, and productivity insights powered by advanced AI analysis of your coding patterns.',
    target: 'ai-insights-card',
    icon: <Brain className="h-5 w-5" />,
    position: 'left',
    priority: 'high'
  },
  {
    id: 'health-score',
    title: 'Developer Health Score',
    description: 'Monitor your wellbeing with our comprehensive health scoring system that tracks work-life balance, stress levels, and productivity patterns.',
    target: 'health-score',
    icon: <Activity className="h-5 w-5" />,
    position: 'bottom',
    priority: 'high'
  },
  {
    id: 'team-ranking',
    title: 'Team Collaboration',
    description: 'See how you\'re performing within your team, identify collaboration opportunities, and celebrate achievements together.',
    target: 'team-ranking',
    icon: <Users className="h-5 w-5" />,
    position: 'right',
    priority: 'medium'
  },
  {
    id: 'goals-tracking',
    title: 'Goal Setting & Tracking',
    description: 'Set personalized development goals and track your progress with intelligent milestone detection and achievement celebrations.',
    target: 'goals-section',
    icon: <Target className="h-5 w-5" />,
    position: 'top',
    priority: 'medium'
  },
  {
    id: 'schedule-optimization',
    title: 'Smart Scheduling',
    description: 'Optimize your work schedule based on your energy patterns, focus times, and productivity peaks for maximum efficiency.',
    target: 'schedule-widget',
    icon: <Calendar className="h-5 w-5" />,
    position: 'left',
    priority: 'medium'
  }
]

interface OnboardingTourProps {
  isVisible: boolean
  onComplete: () => void
  onSkip: () => void
}

export default function OnboardingTour({ isVisible, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const currentTourStep = tourSteps[currentStep]

  useEffect(() => {
    if (!isVisible) return

    const updateTooltipPosition = () => {
      const targetElement = document.querySelector(`[data-tour="${currentTourStep.target}"]`)
      if (!targetElement || !tooltipRef.current) return

      const targetRect = targetElement.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      
      let x = 0, y = 0

      switch (currentTourStep.position) {
        case 'top':
          x = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2)
          y = targetRect.top - tooltipRect.height - 16
          break
        case 'bottom':
          x = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2)
          y = targetRect.bottom + 16
          break
        case 'left':
          x = targetRect.left - tooltipRect.width - 16
          y = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2)
          break
        case 'right':
          x = targetRect.right + 16
          y = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2)
          break
      }

      // Keep tooltip within viewport
      x = Math.max(16, Math.min(x, window.innerWidth - tooltipRect.width - 16))
      y = Math.max(16, Math.min(y, window.innerHeight - tooltipRect.height - 16))

      setTooltipPosition({ x, y })
    }

    updateTooltipPosition()
    window.addEventListener('resize', updateTooltipPosition)
    window.addEventListener('scroll', updateTooltipPosition)

    return () => {
      window.removeEventListener('resize', updateTooltipPosition)
      window.removeEventListener('scroll', updateTooltipPosition)
    }
  }, [currentStep, isVisible, currentTourStep])

  useEffect(() => {
    if (!isVisible) return

    // Highlight target element
    const targetElement = document.querySelector(`[data-tour="${currentTourStep.target}"]`)
    if (targetElement) {
      targetElement.classList.add('tour-highlight')
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove('tour-highlight')
      }
    }
  }, [currentStep, isVisible, currentTourStep])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      }, 200)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsAnimating(false)
      }, 200)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  if (!isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-none" />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-6 max-w-sm transition-all duration-200 ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              {currentTourStep.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                {currentTourStep.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {currentStep + 1} of {tourSteps.length}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 leading-relaxed">
            {currentTourStep.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip tour
          </button>
          
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < tourSteps.length - 1 && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tour highlight styles */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 45;
          border-radius: 8px;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 0 2px rgba(59, 130, 246, 0.6);
          transition: all 0.3s ease;
        }
        
        .tour-highlight::before {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 12px;
          background: rgba(59, 130, 246, 0.1);
          animation: pulse 2s infinite;
          pointer-events: none;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.02); }
        }
      `}</style>
    </>
  )
}
