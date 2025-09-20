import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface FocusTimeData {
  focusTimeToday: number;
  currentSession: number;
  isActive: boolean;
  sessionStartTime: Date | null;
  sessionId: string | null;
}

export const useFocusTime = () => {
  const [focusData, setFocusData] = useState<FocusTimeData>({
    focusTimeToday: 0,
    currentSession: 0,
    isActive: false,
    sessionStartTime: null,
    sessionId: null
  });
  const [loading, setLoading] = useState(true);

  // Fetch initial focus data
  useEffect(() => {
    const fetchFocusData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const sessionResponse = await fetch(`${apiUrl}/api/auth/session`, {
          credentials: 'include'
        });
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.user || sessionData.user.id === 'demo-user') {
          console.log('Demo mode: using local focus tracking');
          setLoading(false);
          return;
        }
        
        const focusResponse = await apiClient.getFocusStats();
        if (focusResponse.success) {
          const { todayMinutes, currentSession } = focusResponse.data;
          
          setFocusData(prev => ({
            ...prev,
            focusTimeToday: todayMinutes
          }));

          // Restore active session if exists
          if (currentSession && currentSession.isActive) {
            const startTime = new Date(currentSession.startTime);
            const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60);
            
            setFocusData(prev => ({
              ...prev,
              isActive: true,
              sessionId: currentSession.id,
              sessionStartTime: startTime,
              currentSession: elapsed
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch focus data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFocusData();
  }, []);

  // Timer for active sessions
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (focusData.isActive && focusData.sessionStartTime) {
      const updateTime = () => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - focusData.sessionStartTime!.getTime()) / 1000 / 60);
        setFocusData(prev => ({ ...prev, currentSession: elapsed }));
      };
      
      updateTime();
      interval = setInterval(updateTime, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusData.isActive, focusData.sessionStartTime]);

  const totalFocusTime = focusData.focusTimeToday + (focusData.isActive ? focusData.currentSession : 0);

  const startSession = async () => {
    if (!focusData.isActive) {
      try {
        const response = await apiClient.startFocusSession();
        if (response.success) {
          setFocusData(prev => ({
            ...prev,
            isActive: true,
            sessionId: response.data.sessionId,
            sessionStartTime: new Date(response.data.startTime),
            currentSession: 0
          }));
        }
      } catch (error) {
        console.error('Failed to start focus session:', error);
        // Fallback to local session
        setFocusData(prev => ({
          ...prev,
          isActive: true,
          sessionStartTime: new Date(),
          currentSession: 0,
          sessionId: `local-${Date.now()}`
        }));
      }
    }
  };

  const endSession = async () => {
    if (focusData.sessionId && focusData.isActive) {
      try {
        if (!focusData.sessionId.startsWith('local-')) {
          const response = await apiClient.endFocusSession(focusData.sessionId);
          if (response.success) {
            setFocusData(prev => ({
              ...prev,
              focusTimeToday: prev.focusTimeToday + response.data.duration
            }));
          }
        } else {
          // Local session
          setFocusData(prev => ({
            ...prev,
            focusTimeToday: prev.focusTimeToday + prev.currentSession
          }));
        }
      } catch (error) {
        console.error('Failed to end focus session:', error);
        setFocusData(prev => ({
          ...prev,
          focusTimeToday: prev.focusTimeToday + prev.currentSession
        }));
      }
    }
    
    setFocusData(prev => ({
      ...prev,
      isActive: false,
      sessionStartTime: null,
      currentSession: 0,
      sessionId: null
    }));
  };

  return {
    focusData,
    totalFocusTime,
    loading,
    startSession,
    endSession
  };
};
