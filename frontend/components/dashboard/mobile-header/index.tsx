"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MonkeyIcon from "@/components/icons/monkey";
import MobileNotifications from "@/components/dashboard/notifications/mobile-notifications";
import type { MockData, Notification } from "@/types/dashboard";
import BellIcon from "@/components/icons/bell";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface MobileHeaderProps {
  mockData?: MockData;
}

export function MobileHeader({ mockData }: MobileHeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      // Check if we're in demo mode
      const isDemoMode = document.cookie.includes('demo_mode=true');
      
      if (isDemoMode) {
        console.log('Demo mode: skipping mobile header notifications API call');
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
        // Fallback to mock data
        if (mockData) {
          setNotifications(mockData.notifications);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [mockData]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="lg:hidden h-header-mobile sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Sidebar Menu */}
        <SidebarTrigger />

        {/* Center: Monkey Logo + Time */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-primary rounded flex items-center justify-center">
              <MonkeyIcon className="size-6 text-primary-foreground" />
            </div>
          </div>
        </div>

        <Sheet>
          {/* Right: Notifications Menu */}
          <SheetTrigger asChild>
            <Button variant="secondary" size="icon" className="relative">
              {unreadCount > 0 && (
                <Badge className="absolute border-2 border-background -top-1 -left-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
              <BellIcon className="size-4" />
            </Button>
          </SheetTrigger>

          {/* Notifications Sheet */}
          <SheetContent
            closeButton={false}
            side="right"
            className="w-[80%] max-w-md p-0"
          >
            <MobileNotifications
              initialNotifications={notifications}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
