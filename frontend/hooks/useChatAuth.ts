'use client'

import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { useChatState } from '@/components/chat/use-chat-state'

export function useChatAuth() {
  const { user, isLoading } = useAuth()
  const { setAuthenticated } = useChatState()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // User is authenticated, switch to real chat
        setAuthenticated(true, user)
      } else {
        // User is not authenticated, use demo mode
        setAuthenticated(false)
      }
    }
  }, [user, isLoading, setAuthenticated])

  return { user, isLoading }
}
