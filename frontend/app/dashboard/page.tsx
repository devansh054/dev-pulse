"use client";

import { useState, useEffect, useMemo } from "react";
import { BracketsIcon, GearIcon, BoomIcon } from "@/components/icons";
import DashboardPageLayout from "@/components/dashboard/layout";
import { SidebarProvider } from "@/components/ui/sidebar";
import mockDataJson from "@/mock.json";
import type { MockData } from "@/types/dashboard";
import DeveloperHealthScore from "@/components/dashboard/developer-health-score";
import AIInsightsCard from "@/components/dashboard/ai-insights-card";
import FocusTime from "@/components/dashboard/focus-time";
import DashboardStat from "@/components/dashboard/stat";
import DashboardChart from "@/components/dashboard/chart";
import DeveloperRanking from "@/components/dashboard/developer-ranking";
import CodeHealthStatus from "@/components/dashboard/code-health-status";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { apiClient, transformToDashboardStats } from "@/lib/api";
import OnboardingTour from "@/components/onboarding/onboarding-tour";
import DemoModeBanner from "@/components/onboarding/demo-mode-banner";
import FeatureSpotlight from "@/components/onboarding/feature-spotlight";
import HelpButton from "@/components/onboarding/help-button";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useFocusTime } from "@/hooks/useFocusTime";
import { useGitHubData } from "@/hooks/useGitHubData";

const mockData = mockDataJson as MockData;

// Icon mapping for developer metrics
const iconMap = {
  gear: GearIcon,
  boom: BoomIcon,
};

export default function DashboardPage() {
  console.log("🏠 DashboardPage component rendering - VERSION 2.0");
  
  const { syncMessage } = useSyncStatus();
  const { showTour, startTour, completeTour } = useOnboarding();
  const { totalFocusTime } = useFocusTime();
  const [stats, setStats] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [showFeatureSpotlight, setShowFeatureSpotlight] = useState(true);
  const [realData, setRealData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true); // Default to demo mode
  
  // Always call the hook, but conditionally fetch data inside it
  const { repositories, activities, stats: githubStats, loading: githubLoading, error: githubError } = useGitHubData();
  
  console.log('Dashboard: isDemo =', isDemo, 'githubStats =', githubStats);

  useEffect(() => {
    console.log('Dashboard: useEffect running - checking authentication');
    
    // Check if demo mode is explicitly requested via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const isDemoMode = urlParams.get('demo') === 'true';
    
    if (isDemoMode) {
      console.log('Dashboard: 🎭 Demo mode explicitly requested, using mock data');
      setIsDemo(true);
      setLoading(false);
      return;
    }

    // Check if user is demo user
    const userStr = localStorage.getItem('devpulse_user');
    const token = localStorage.getItem('devpulse_token');
    
    console.log('Dashboard: Checking authentication...');
    console.log('Dashboard: User data:', userStr);
    console.log('Dashboard: Token exists:', !!token);
    
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('Dashboard: Parsed user:', user);
      
      if (user.id === 'demo-user') {
        console.log('Dashboard: Demo user detected, using mock data');
        setIsDemo(true);
        setLoading(false);
        return;
      }
    }

    if (!userStr || !token) {
      console.log('Dashboard: No user data or token, defaulting to demo mode');
      setIsDemo(true);
      setLoading(false);
      return;
    }

    // Real user - data will be loaded by useGitHubData hook
    console.log('Dashboard: Real user detected, enabling GitHub data integration');
    setIsDemo(false);
    setLoading(false);
  }, []);
  
  // Create stats from real GitHub data or use mock data
  const statsToShow = useMemo(() => {
    console.log('Dashboard: isDemo =', isDemo, 'githubStats =', githubStats, 'githubLoading =', githubLoading, 'githubError =', githubError);
    
    if (isDemo || !githubStats) {
      console.log('Dashboard: Using mock data');
      return mockData.dashboardStats;
    }

    console.log('Dashboard: Using real GitHub stats:', githubStats);

    // Transform real GitHub stats to dashboard format
    return [
      {
        label: "Focus Time",
        value: "0h", // Will be updated below
        description: "+12%",
        icon: GearIcon,
        intent: "positive" as const,
        direction: "up" as const
      },
      {
        label: "Repositories",
        value: githubStats.totalRepositories.toString(),
        description: `${githubStats.publicRepos} public`,
        icon: BoomIcon,
        intent: "positive" as const,
        direction: "up" as const
      },
      {
        label: "Total Stars",
        value: githubStats.totalStars.toString(),
        description: "across all repos",
        icon: GearIcon,
        intent: "positive" as const,
        direction: "up" as const
      },
      {
        label: "Languages",
        value: githubStats.topLanguages.length.toString(),
        description: githubStats.topLanguages[0]?.language || "None",
        icon: BoomIcon,
        intent: "positive" as const,
        direction: "up" as const
      }
    ];
  }, [isDemo, githubStats, mockData.dashboardStats]);
  
  // Update focus time stat with real-time data
  if (statsToShow.length > 0) {
    const focusHours = Math.floor(totalFocusTime / 60);
    const focusMinutes = totalFocusTime % 60;
    const focusTimeDisplay = focusMinutes > 0 ? `${focusHours}h ${focusMinutes}m` : `${focusHours}h`;
    
    statsToShow[0] = {
      ...statsToShow[0],
      value: focusTimeDisplay
    };
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Developer Intelligence",
        description: "Your productivity insights at a glance",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsToShow.map((stat, index) => (
          <DashboardStat key={index} {...stat} />
        ))}
      </div>

      {/* Productivity Analytics Chart */}
      <div className="mb-6" data-tour="productivity-chart">
        <DashboardChart />
      </div>

      {/* AI Insights and Focus Time Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div data-tour="ai-insights">
          <AIInsightsCard />
        </div>
        <div data-tour="focus-time">
          <FocusTime />
        </div>
      </div>

      {/* Main 2-column grid section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div data-tour="team-ranking">
          <DeveloperRanking />
        </div>
        <CodeHealthStatus />
      </div>

      <OnboardingTour 
        isVisible={showTour} 
        onComplete={completeTour}
        onSkip={completeTour}
      />
      
      <HelpButton onStartTour={startTour} />
    </DashboardPageLayout>
  );
}
