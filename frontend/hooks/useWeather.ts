'use client';

import { useState, useEffect } from 'react';
import { WeatherService } from '@/lib/weather';

interface WeatherData {
  temperature: string;
  weather: string;
  description: string;
  humidity: number;
  windSpeed: number;
}

export function useWeather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await WeatherService.getTorontoWeather();
        setWeatherData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch weather immediately
    fetchWeather();

    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    weatherData,
    loading,
    error,
    timezone: WeatherService.getTorontoTimezone()
  };
}
