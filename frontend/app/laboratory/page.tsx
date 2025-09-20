"use client";

import { useState, useEffect } from 'react'
import DashboardPageLayout from '@/components/dashboard/layout'
import { SidebarProvider } from '@/components/ui/sidebar'
import DashboardStat from '@/components/dashboard/stat'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Play, Square, Trash2, Atom, Zap } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import CreateExperimentDialog from '@/components/laboratory/create-experiment-dialog'
import mockData from '@/mock.json'

// Icon mapping
const iconMap = {
  gear: Zap,
  boom: Atom,
}

interface LaboratoryStats {
  activeExperiments: number;
  totalExperiments: number;
  testCoverage: number;
  performanceTests: number;
  pendingExperiments: number;
  completedExperiments: number;
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  startDate?: string;
  endDate?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  benchmarks: any[];
  testRuns: any[];
}

export default function LaboratoryPage() {
  const [stats, setStats] = useState<LaboratoryStats | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaboratoryData = async () => {
      try {
        // Check authentication
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.user || sessionData.user.id === 'demo-user') {
          console.log('Demo mode - using mock laboratory data');
          setIsDemo(true);
          setStats({
            activeExperiments: 12,
            totalExperiments: 15,
            testCoverage: 87,
            performanceTests: 24,
            pendingExperiments: 2,
            completedExperiments: 1
          });
          setExperiments([
            {
              id: 1,
              name: "API Response Optimization",
              description: "Testing different caching strategies for API endpoints",
              type: "performance",
              status: "running",
              progress: 75,
              priority: "high",
              startDate: "2024-07-08T00:00:00Z",
              estimatedDuration: 40,
              tags: ["performance", "api", "caching"],
              createdAt: "2024-07-08T00:00:00Z",
              updatedAt: "2024-07-10T00:00:00Z",
              benchmarks: [],
              testRuns: []
            },
            {
              id: 2,
              name: "Database Query Performance",
              description: "Analyzing query optimization techniques",
              type: "optimization",
              status: "completed",
              progress: 100,
              priority: "medium",
              startDate: "2024-07-01T00:00:00Z",
              endDate: "2024-07-05T00:00:00Z",
              estimatedDuration: 32,
              actualDuration: 28,
              tags: ["database", "performance"],
              createdAt: "2024-07-01T00:00:00Z",
              updatedAt: "2024-07-05T00:00:00Z",
              benchmarks: [],
              testRuns: []
            },
            {
              id: 3,
              name: "Frontend Bundle Size",
              description: "Reducing JavaScript bundle size through code splitting",
              type: "optimization",
              status: "pending",
              progress: 0,
              priority: "low",
              estimatedDuration: 24,
              tags: ["frontend", "optimization"],
              createdAt: "2024-07-15T00:00:00Z",
              updatedAt: "2024-07-15T00:00:00Z",
              benchmarks: [],
              testRuns: []
            }
          ]);
          setLoading(false);
          return;
        }

        // Fetch real data for authenticated users
        const [statsResponse, experimentsResponse] = await Promise.all([
          apiClient.getLaboratoryStats(),
          apiClient.getExperiments()
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        if (experimentsResponse.success) {
          setExperiments(experimentsResponse.data.experiments);
        }

      } catch (error) {
        console.error('Error fetching laboratory data:', error);
        // Fallback to demo data on error
        setIsDemo(true);
        setStats({
          activeExperiments: 0,
          totalExperiments: 0,
          testCoverage: 0,
          performanceTests: 0,
          pendingExperiments: 0,
          completedExperiments: 0
        });
        setExperiments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLaboratoryData();
  }, []);

  const handleStartExperiment = async (experimentId: string) => {
    if (isDemo) return;
    
    setActionLoading(experimentId);
    try {
      const response = await apiClient.startExperiment(experimentId);
      if (response.success) {
        setExperiments(prev => prev.map(exp => 
          exp.id === experimentId 
            ? { ...exp, status: 'running', startDate: new Date().toISOString(), progress: 0 }
            : exp
        ));
      }
    } catch (error) {
      console.error('Error starting experiment:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteExperiment = async (experimentId: string) => {
    if (isDemo) return;
    
    setActionLoading(experimentId);
    try {
      const response = await apiClient.completeExperiment(experimentId);
      if (response.success) {
        setExperiments(prev => prev.map(exp => 
          exp.id === experimentId 
            ? { ...exp, status: 'completed', endDate: new Date().toISOString(), progress: 100 }
            : exp
        ));
      }
    } catch (error) {
      console.error('Error completing experiment:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteExperiment = async (experimentId: string) => {
    setActionLoading(experimentId);
    try {
      const response = await apiClient.deleteExperiment(experimentId);
      if (response.success) {
        setExperiments(prev => prev.filter(exp => exp.id !== experimentId));
      }
    } catch (error) {
      console.error('Error deleting experiment:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExperimentCreated = (newExperiment: any) => {
    setExperiments(prev => [newExperiment, ...prev]);
    // Refresh stats by re-fetching data
    if (!isDemo) {
      fetchLaboratoryData();
    }
  };

  const fetchLaboratoryData = async () => {
    try {
      // Check authentication
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      
      if (!sessionData.user || sessionData.user.id === 'demo-user') {
        console.log('Demo mode - using mock laboratory data');
        setIsDemo(true);
        setStats(mockData.laboratory.stats);
        setExperiments(mockData.laboratory.experiments);
        return;
      }

      // Fetch real data
      const [statsResponse, experimentsResponse] = await Promise.all([
        apiClient.getLaboratoryStats(),
        apiClient.getExperiments()
      ]);

      if (statsResponse.success && experimentsResponse.success) {
        setStats(statsResponse.data);
        setExperiments(experimentsResponse.data.experiments || []);
        setIsDemo(false);
      } else {
        // Fallback to mock data
        setIsDemo(true);
        setStats(mockData.laboratory.stats);
        setExperiments(mockData.laboratory.experiments);
      }
    } catch (error) {
      console.error('Error fetching laboratory data:', error);
      // Fallback to mock data
      setIsDemo(true);
      setStats(mockData.laboratory.stats);
      setExperiments(mockData.laboratory.experiments);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardPageLayout
        header={{
          title: "Laboratory",
          description: "Loading experiments...",
          }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardPageLayout>
    );
  }

  const laboratoryStats = [
    {
      label: "Active Experiments",
      value: stats?.activeExperiments.toString() || "0",
      description: "Running code experiments",
      icon: "gear" as const,
      tag: "ACTIVE",
      intent: "positive" as const,
      direction: "up" as const
    },
    {
      label: "Test Coverage",
      value: `${stats?.testCoverage || 0}%`,
      description: "Code coverage percentage",
      icon: "gear" as const,
      tag: "HIGH",
      intent: "positive" as const,
      direction: "up" as const
    },
    {
      label: "Performance Tests",
      value: stats?.performanceTests.toString() || "0",
      description: "Benchmark tests completed",
      icon: "boom" as const,
      tag: "COMPLETED",
      intent: "neutral" as const,
      direction: undefined
    }
  ];

  return (
    <DashboardPageLayout
      header={{
        title: "Laboratory",
        description: `Code experiments and performance testing • ${stats?.activeExperiments || 0} active experiments`,
      }}
    >
      {/* Laboratory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {laboratoryStats.map((stat, index) => (
          <DashboardStat
            key={index}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            icon={iconMap[stat.icon as keyof typeof iconMap]}
            tag={stat.tag}
            intent={stat.intent}
            direction={stat.direction}
          />
        ))}
      </div>

      {/* Experiments List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Experiments</h2>
          {!isDemo && (
            <CreateExperimentDialog onExperimentCreated={handleExperimentCreated} />
          )}
        </div>
        
        {experiments.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground mb-4">No experiments found</p>
            {!isDemo && (
              <CreateExperimentDialog 
                onExperimentCreated={handleExperimentCreated}
                trigger={
                  <Button className="flex items-center gap-2 mx-auto">
                    <Plus className="h-4 w-4" />
                    Create Your First Experiment
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {experiments.map((experiment) => (
              <div key={experiment.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium">{experiment.name}</h3>
                      <Badge className={getStatusColor(experiment.status)}>
                        {experiment.status.toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(experiment.priority)}>
                        {experiment.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{experiment.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {experiment.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {!isDemo && (
                    <div className="flex items-center gap-2 ml-4">
                      {experiment.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartExperiment(experiment.id)}
                          disabled={actionLoading === experiment.id}
                          className="flex items-center gap-1"
                        >
                          {actionLoading === experiment.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                          Start
                        </Button>
                      )}
                      
                      {experiment.status === 'running' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompleteExperiment(experiment.id)}
                          disabled={actionLoading === experiment.id}
                          className="flex items-center gap-1"
                        >
                          {actionLoading === experiment.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          ) : (
                            <Square className="h-3 w-3" />
                          )}
                          Complete
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteExperiment(experiment.id)}
                        disabled={actionLoading === experiment.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{experiment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${experiment.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Started:</span><br />
                    {formatDate(experiment.startDate)}
                  </div>
                  <div>
                    <span className="font-medium">Completed:</span><br />
                    {formatDate(experiment.endDate)}
                  </div>
                  <div>
                    <span className="font-medium">Est. Duration:</span><br />
                    {experiment.estimatedDuration ? `${experiment.estimatedDuration}h` : 'Not set'}
                  </div>
                  <div>
                    <span className="font-medium">Actual Duration:</span><br />
                    {experiment.actualDuration ? `${experiment.actualDuration}h` : 'Not set'}
                  </div>
                </div>

                {experiment.benchmarks.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Recent Benchmarks</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      {experiment.benchmarks.slice(0, 3).map((benchmark, idx) => (
                        <div key={idx} className="bg-gray-50 rounded p-2">
                          <div className="font-medium">{benchmark.name}</div>
                          <div className="text-muted-foreground">
                            {benchmark.value}{benchmark.unit}
                            {benchmark.improvement && (
                              <span className={benchmark.improvement > 0 ? 'text-green-600' : 'text-red-600'}>
                                {' '}({benchmark.improvement > 0 ? '+' : ''}{benchmark.improvement.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Start New Experiment</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a new code experiment to test performance improvements or new features.
          </p>
          {!isDemo ? (
            <CreateExperimentDialog 
              onExperimentCreated={handleExperimentCreated}
              trigger={
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Experiment
                </Button>
              }
            />
          ) : (
            <Button className="flex items-center gap-2" disabled>
              <Plus className="h-4 w-4" />
              Create Experiment
            </Button>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Performance Benchmarks</h3>
          <p className="text-sm text-muted-foreground mb-4">
            View detailed performance metrics and benchmark results from recent tests.
          </p>
          <Button variant="secondary" className="flex items-center gap-2" disabled={isDemo}>
            View Benchmarks
          </Button>
        </div>
      </div>
    </DashboardPageLayout>
  )
}
