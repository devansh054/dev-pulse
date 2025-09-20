"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bullet } from "@/components/ui/bullet";
import NotificationItem from "./notification-item";
import type { Notification } from "@/types/dashboard";
import { AnimatePresence, motion } from "framer-motion";
import { apiClient } from "@/lib/api";

interface NotificationsProps {
  initialNotifications?: Notification[];
}

export default function Notifications({
  initialNotifications = [],
}: NotificationsProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(true);

  const mockNotifications: Notification[] = [
    {
      id: 'notif1',
      title: 'Code Quality Alert',
      message: 'Your code complexity has increased by 12% this week. Consider refactoring the authentication module.',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'warning',
      priority: 'high'
    },
    {
      id: 'notif2',
      title: 'Productivity Milestone',
      message: 'Congratulations! You\'ve completed 15 commits this week, beating your previous record.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      type: 'success',
      priority: 'medium'
    },
    {
      id: 'notif3',
      title: 'Collaboration Insight',
      message: 'You have 3 pending code reviews. Reviewing code helps improve team productivity.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true,
      type: 'info',
      priority: 'medium'
    },
    {
      id: 'notif4',
      title: 'Performance Tip',
      message: 'Your API response times have improved by 23% after recent optimizations.',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      read: true,
      type: 'success',
      priority: 'low'
    }
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      // Check if we're in demo mode
      const isDemoMode = document.cookie.includes('demo_mode=true') || 
                        new URLSearchParams(window.location.search).get('demo') === 'true';
      
      if (isDemoMode) {
        console.log('Demo mode: using mock notifications');
        setNotifications(mockNotifications);
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.getUserInsights();
        if (response.success && response.data?.insights) {
          // Transform insights to notifications format
          const transformedNotifications: Notification[] = response.data.insights.map(insight => ({
            id: insight.id,
            title: insight.title,
            description: insight.description,
            message: insight.description,
            time: new Date(insight.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: insight.createdAt,
            read: insight.read,
            type: insight.type as any,
            priority: 'medium' as const
          }));
          setNotifications(transformedNotifications);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        // Fallback to mock notifications on error
        setNotifications(mockNotifications);
      } finally {
        setLoading(false);
      }
    };

    if (initialNotifications.length === 0) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [initialNotifications]);
  const [showAll, setShowAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 3);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between pl-3 pr-1">
        <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
          {unreadCount > 0 ? <Badge>{unreadCount}</Badge> : <Bullet />}
          Notifications
        </CardTitle>
        {notifications.length > 0 && (
          <Button
            className="opacity-50 hover:opacity-100 uppercase"
            size="sm"
            variant="ghost"
            onClick={clearAll}
          >
            Clear All
          </Button>
        )}
      </CardHeader>

      <CardContent className="bg-accent p-1.5 overflow-hidden">
        <div className="space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {displayedNotifications.map((notification) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                key={notification.id}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              </motion.div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No notifications
                </p>
              </div>
            )}

            {notifications.length > 3 && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full"
                >
                  {showAll ? "Show Less" : `Show All (${notifications.length})`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
