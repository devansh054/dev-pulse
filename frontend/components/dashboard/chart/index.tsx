"use client"

import * as React from "react"
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import mockDataJson from "@/mock.json"
import { Bullet } from "@/components/ui/bullet"
import type { MockData, TimePeriod } from "@/types/dashboard"
import { apiClient, transformChartData } from "@/lib/api"

const mockData = mockDataJson as MockData

type ChartDataPoint = {
  date: string
  spendings: number
  sales: number
  coffee: number
}

const chartConfig = {
  spendings: {
    label: "Focus Time",
    color: "var(--chart-1)",
  },
  sales: {
    label: "Code Quality",
    color: "var(--chart-2)",
  },
  coffee: {
    label: "Collaboration",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

interface DashboardChartProps {
  data?: {
    week: ChartDataPoint[]
    month: ChartDataPoint[]
    year: ChartDataPoint[]
  }
}

export default function DashboardChart({ data }: DashboardChartProps = {}) {
  const [activeTab, setActiveTab] = React.useState<TimePeriod>("week")
  const [chartData, setChartData] = React.useState(data || mockData.chartData)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      // Check if user is authenticated by checking session
      try {
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.user || sessionData.user.id === 'demo-user') {
          console.log('Demo mode: skipping chart API calls, using mock data');
          setLoading(false);
          return;
        }
        
        console.log('Authenticated user detected, fetching real chart data');
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Fetching trends data...');
        const [weekResponse, monthResponse, yearResponse] = await Promise.all([
          apiClient.getProductivityTrends('week'),
          apiClient.getProductivityTrends('month'),
          apiClient.getProductivityTrends('year')
        ]);

        console.log('📊 API Responses:', {
          week: weekResponse,
          month: monthResponse,
          year: yearResponse
        });
        
        console.log('🔍 Response data structure:', {
          weekData: weekResponse.data,
          weekProductivity: (weekResponse.data as any)?.productivity,
          monthData: monthResponse.data,
          monthProductivity: (monthResponse.data as any)?.productivity,
          yearData: yearResponse.data,
          yearProductivity: (yearResponse.data as any)?.productivity
        });

        if (weekResponse.success && monthResponse.success && yearResponse.success) {
          const transformedData = {
            week: transformChartData((weekResponse.data as any)?.productivity || []),
            month: transformChartData((monthResponse.data as any)?.productivity || []),
            year: transformChartData((yearResponse.data as any)?.productivity || [])
          };
          
          console.log('📈 Transformed chart data:', transformedData);
          console.log('📈 Week data sample:', transformedData.week.slice(0, 3));
          console.log('📈 Chart data length - Week:', transformedData.week.length, 'Month:', transformedData.month.length, 'Year:', transformedData.year.length);
          setChartData(transformedData);
        } else {
          console.warn('⚠️ Some API calls failed, using mock data');
          setChartData(mockData.chartData);
        }
      } catch (error) {
        console.error('❌ Failed to fetch trends data:', error);
        console.log('📋 Falling back to mock data');
        setChartData(mockData.chartData);
      } finally {
        setLoading(false);
      }
    };

    if (!data) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [data])

  const handleTabChange = (value: string) => {
    if (value === "week" || value === "month" || value === "year") {
      setActiveTab(value as TimePeriod)
    }
  }

  const formatYAxisValue = (value: number) => {
    // Hide the "0" value by returning empty string
    if (value === 0) {
      return ""
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  const renderChart = (data: ChartDataPoint[]) => {
    console.log('🎨 Rendering chart with data:', data);
    console.log('🎨 Data length:', data.length);
    console.log('🎨 Loading state:', loading);
    
    if (loading) {
      return (
        <div className="bg-accent rounded-lg p-3 animate-pulse">
          <div className="h-48 bg-muted/30 rounded"></div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No data to render, showing empty state');
      return (
        <div className="bg-accent rounded-lg p-3">
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </div>
      );
    }

    return (
      <div className="bg-accent rounded-lg p-3">
        <ChartContainer className="md:aspect-[3/1] w-full" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: -12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <defs>
              <linearGradient id="fillSpendings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-spendings)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-spendings)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillCoffee" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-coffee)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-coffee)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontal={false}
              strokeDasharray="8 8"
              strokeWidth={2}
              stroke="var(--foreground)"
              opacity={0.2}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={12}
              strokeWidth={1.5}
              className="uppercase text-sm fill-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={0}
              tickCount={6}
              className="text-sm fill-foreground"
              tickFormatter={formatYAxisValue}
              domain={[0, "dataMax"]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" className="min-w-[200px] px-4 py-3" />}
            />
            <Area
              dataKey="spendings"
              type="linear"
              fill="url(#fillSpendings)"
              fillOpacity={0.4}
              stroke="var(--color-spendings)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              dataKey="sales"
              type="linear"
              fill="url(#fillSales)"
              fillOpacity={0.4}
              stroke="var(--color-sales)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              dataKey="coffee"
              type="linear"
              fill="url(#fillCoffee)"
              fillOpacity={0.4}
              stroke="var(--color-coffee)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="max-md:gap-4">
      <div className="flex items-center justify-between mb-4 max-md:contents">
        <TabsList className="max-md:w-full">
          <TabsTrigger value="week">WEEK</TabsTrigger>
          <TabsTrigger value="month">MONTH</TabsTrigger>
          <TabsTrigger value="year">YEAR</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-6 max-md:order-1">
          {Object.entries(chartConfig).map(([key, value]) => (
            <ChartLegend key={key} label={value.label} color={value.color} />
          ))}
        </div>
      </div>
      <TabsContent value="week" className="space-y-4">
        {renderChart(chartData.week)}
      </TabsContent>
      <TabsContent value="month" className="space-y-4">
        {renderChart(chartData.month)}
      </TabsContent>
      <TabsContent value="year" className="space-y-4">
        {renderChart(chartData.year)}
      </TabsContent>
    </Tabs>
  )
}

export const ChartLegend = ({
  label,
  color,
}: {
  label: string
  color: string
}) => {
  return (
    <div className="flex items-center gap-2 uppercase">
      <Bullet style={{ backgroundColor: color }} className="rotate-45" />
      <span className="text-sm font-medium text-foreground/80">{label}</span>
    </div>
  )
}
