"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./useAuth"

interface OnboardingState {
  isFirstVisit: boolean
  hasCompletedTour: boolean
  tourStep: number
  showTour: boolean
  isDemo: boolean
}

export function useOnboarding() {
  const { user, isLoading } = useAuth()
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isFirstVisit: true,
    hasCompletedTour: false,
    tourStep: 0,
    showTour: false,
    isDemo: !user
  })

  useEffect(() => {
    if (isLoading) return

    const storageKey = user?.id 
      ? `onboarding_${user.id}` 
      : 'onboarding_demo'
    
    const savedState = localStorage.getItem(storageKey)
    
    if (savedState) {
      const parsed = JSON.parse(savedState)
      setOnboardingState({
        ...parsed,
        isDemo: !user,
        showTour: false // Don't auto-show on subsequent visits
      })
    } else {
      // First visit - show tour after a brief delay
      setTimeout(() => {
        setOnboardingState(prev => ({
          ...prev,
          showTour: true,
          isDemo: !user
        }))
      }, 1500)
    }
  }, [user, isLoading])

  const startTour = () => {
    setOnboardingState(prev => ({
      ...prev,
      showTour: true,
      tourStep: 0
    }))
  }

  const completeTour = () => {
    const newState = {
      ...onboardingState,
      hasCompletedTour: true,
      showTour: false,
      isFirstVisit: false
    }
    
    setOnboardingState(newState)
    
    const storageKey = user?.id 
      ? `onboarding_${user.id}` 
      : 'onboarding_demo'
    
    localStorage.setItem(storageKey, JSON.stringify(newState))
  }

  const skipTour = () => {
    const newState = {
      ...onboardingState,
      showTour: false,
      isFirstVisit: false
    }
    
    setOnboardingState(newState)
    
    const storageKey = user?.id 
      ? `onboarding_${user.id}` 
      : 'onboarding_demo'
    
    localStorage.setItem(storageKey, JSON.stringify(newState))
  }

  const resetOnboarding = () => {
    const storageKey = user?.id 
      ? `onboarding_${user.id}` 
      : 'onboarding_demo'
    
    localStorage.removeItem(storageKey)
    setOnboardingState({
      isFirstVisit: true,
      hasCompletedTour: false,
      tourStep: 0,
      showTour: true,
      isDemo: !user
    })
  }

  return {
    ...onboardingState,
    startTour,
    completeTour,
    skipTour,
    resetOnboarding
  }
}
