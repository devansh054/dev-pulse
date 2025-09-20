"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TVNoise from "@/components/ui/tv-noise";
import type { WidgetData } from "@/types/dashboard";
import { useWeather } from "@/hooks/useWeather";
import Image from "next/image";

interface WidgetProps {
  widgetData?: WidgetData;
}

export default function Widget({ widgetData }: WidgetProps) {
  const { weatherData, loading, timezone } = useWeather();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      timeZone: "America/Toronto",
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const dayOfWeek = date.toLocaleDateString("en-US", {
      timeZone: "America/Toronto",
      weekday: "long",
    });
    const restOfDate = date.toLocaleDateString("en-US", {
      timeZone: "America/Toronto",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return { dayOfWeek, restOfDate };
  };

  const dateInfo = formatDate(currentTime);

  return (
    <Card className="w-full aspect-[2] relative overflow-hidden">
      <TVNoise opacity={0.3} intensity={0.2} speed={40} />
      <CardContent className="bg-accent/30 flex-1 flex flex-col justify-between text-sm font-medium uppercase relative z-20">
        <div className="flex justify-between items-center">
          <span className="opacity-50">{dateInfo.dayOfWeek}</span>
          <span>{dateInfo.restOfDate}</span>
        </div>
        <div className="text-center">
          <div className="text-5xl font-display" suppressHydrationWarning>
            {formatTime(currentTime)}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="opacity-50">
            {loading ? "Loading..." : weatherData?.temperature || widgetData?.temperature || "22°C"}
          </span>
          <span>Toronto, Canada</span>

          <Badge variant="secondary" className="bg-accent">
            {timezone}
          </Badge>
        </div>

        <div className="absolute inset-0 -z-[1]">
          <Image
            src="/assets/pc_blueprint.gif"
            alt="logo"
            width={250}
            height={250}
            className="size-full object-contain"
          />
        </div>
      </CardContent>
    </Card>
  );
}
