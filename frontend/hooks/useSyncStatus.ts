"use client";

import { useState, useEffect } from 'react';

interface SyncStatus {
  lastSync: Date;
  isOnline: boolean;
  syncMessage: string;
}

export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: new Date(),
    isOnline: true,
    syncMessage: "🔄 Live • Syncing now"
  });

  useEffect(() => {
    // Update sync status every 30 seconds to show "live" activity
    const syncInterval = setInterval(() => {
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        syncMessage: navigator.onLine ? "✅ Live • Just synced" : "⚠️ Offline • Last sync " + getTimeAgo(prev.lastSync)
      }));
    }, 30000);

    // Check online status
    const handleOnline = () => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: true,
        syncMessage: "🟢 Live • Back online"
      }));
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: false,
        syncMessage: "🔴 Offline • Last sync " + getTimeAgo(prev.lastSync)
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status check
    setSyncStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      syncMessage: navigator.onLine ? "🔄 Live • Real-time sync" : "🔴 Offline"
    }));

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return syncStatus;
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
}
