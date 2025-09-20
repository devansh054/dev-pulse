"use client";

import { useState, useEffect } from "react";
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

const mockData = mockDataJson as MockData;

// Icon mapping for developer metrics
const iconMap = {
  gear: GearIcon,
  boom: BoomIcon,
};

export default function DashboardPage() {
  console.log("🏠 DashboardPage component rendering");
  
  const { syncMessage } = useSyncStatus();
  const { showTour, startTour, completeTour } = useOnboarding();
  const { totalFocusTime } = useFocusTime();
  const [stats, setStats] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [showFeatureSpotlight, setShowFeatureSpotlight] = useState(true);
  const [realData, setRealData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Check if demo mode is explicitly requested via URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const isDemoMode = urlParams.get('demo') === 'true';
      
      if (isDemoMode) {
        console.log('🎭 Demo mode explicitly requested, using mock data');
        setIsDemo(true);
        setLoading(false);
        return;
      }

      // Check if user is authenticated by checking session
      try {
        const sessionResponse = await fetch('http://localhost:3001/api/auth/session', {
          credentials: 'include'
        });
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.user || sessionData.user.id === 'demo-user') {
          console.log('Demo mode or no authentication, using mock data only');
          setIsDemo(true);
          setLoading(false);
          return;
        }
        
        console.log('Authenticated user detected, fetching real data for:', sessionData.user.login);
      } catch (error) {
        console.error('Error checking session:', error);
        console.log('🎭 Falling back to demo mode due to session error');
        setIsDemo(true);
        setLoading(false);
        return;
      }

      try {
        const [dashboardResponse, githubResponse] = await Promise.all([
          apiClient.getDashboardOverview(),
          apiClient.getGitHubStats()
        ]);

        if (dashboardResponse.success && githubResponse.success) {
          setRealData({
            dashboard: dashboardResponse.data,
            github: githubResponse.data
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  // Use real data if available, fallback to mock data
  const statsToShow = realData ? transformToDashboardStats(realData.github) : mockData.dashboardStats;
  
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
