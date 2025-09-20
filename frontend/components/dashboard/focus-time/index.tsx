"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bullet } from "@/components/ui/bullet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFocusTime } from "@/hooks/useFocusTime";

interface FocusTimeProps {
  className?: string;
}

export default function FocusTime({ className }: FocusTimeProps) {
  const { focusData, totalFocusTime, loading, startSession, endSession } = useFocusTime();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const dailyGoal = 480; // 8 hours
  const progressPercentage = Math.round((totalFocusTime / dailyGoal) * 100);
  const isActive = focusData.isActive;
  const currentSession = focusData.currentSession;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2.5">
          <Bullet />
          Focus Time Today
        </CardTitle>
        <div className="flex items-center gap-2">
          {isActive && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
          <Badge variant="default" className="uppercase">
            {isActive ? "ACTIVE" : "READY"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="bg-accent flex-1 pt-2 md:pt-6 space-y-4">
        {loading ? (
          <div className="text-center animate-pulse">
            <div className="h-12 bg-muted/30 rounded w-32 mx-auto mb-2"></div>
            <div className="h-4 bg-muted/20 rounded w-40 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Focus Time Today */}
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-display text-primary">
                {formatTime(totalFocusTime)}
              </div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground tracking-wide">
                Focus time completed today
              </p>
            </div>
          </>
        )}

        {/* Current Session */}
        {isActive && (
          <div className="text-center border-t pt-4">
            <div className="text-2xl font-display text-blue-600">
              {formatTime(currentSession)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current Session
            </p>
          </div>
        )}

        {!loading && (
          <>
            {/* Daily Progress */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Daily Progress</span>
                <span className="text-sm text-muted-foreground">
                  {formatTime(totalFocusTime)} / {formatTime(dailyGoal)}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                {progressPercentage}% of daily goal
              </p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={startSession}
            disabled={isActive}
            className="flex-1"
            size="sm"
          >
            {isActive ? "Focus Active" : "Start Focus"}
          </Button>
          <Button 
            onClick={endSession}
            variant="outline"
            size="sm"
            className="px-4"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
