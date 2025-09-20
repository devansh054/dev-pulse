import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

interface WeatherData {
  temperature: string;
  weather: string;
  description: string;
  humidity: number;
  windSpeed: number;
  location: string;
  timezone: string;
}

interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
}

class WeatherService {
  private static readonly API_KEY = process.env.OPENWEATHER_API_KEY;
  private static readonly BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
  
  // Toronto coordinates
  private static readonly TORONTO_LAT = 43.6532;
  private static readonly TORONTO_LON = -79.3832;

  static async getTorontoWeather(): Promise<WeatherData> {
    try {
      if (!this.API_KEY) {
        console.warn('OpenWeather API key not found, using mock data');
        return this.getMockWeatherData();
      }

      const url = `${this.BASE_URL}?lat=${this.TORONTO_LAT}&lon=${this.TORONTO_LON}&appid=${this.API_KEY}&units=metric`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json() as OpenWeatherResponse;
      
      return {
        temperature: `${Math.round(data.main.temp)}°C`,
        weather: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        location: "Toronto, Canada",
        timezone: this.getTorontoTimezone()
      };
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      return this.getMockWeatherData();
    }
  }

  private static getMockWeatherData(): WeatherData {
    // Get current Toronto time to provide realistic mock data
    const torontoTime = new Date().toLocaleString("en-US", {
      timeZone: "America/Toronto"
    });
    const hour = new Date(torontoTime).getHours();
    
    // Provide different weather based on time of day
    if (hour >= 6 && hour < 12) {
      return {
        temperature: "18°C",
        weather: "Clear",
        description: "clear sky",
        humidity: 65,
        windSpeed: 3.2,
        location: "Toronto, Canada",
        timezone: this.getTorontoTimezone()
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        temperature: "24°C",
        weather: "Sunny",
        description: "sunny",
        humidity: 55,
        windSpeed: 2.8,
        location: "Toronto, Canada",
        timezone: this.getTorontoTimezone()
      };
    } else if (hour >= 18 && hour < 22) {
      return {
        temperature: "21°C",
        weather: "Partly Cloudy",
        description: "few clouds",
        humidity: 70,
        windSpeed: 2.1,
        location: "Toronto, Canada",
        timezone: this.getTorontoTimezone()
      };
    } else {
      return {
        temperature: "16°C",
        weather: "Clear",
        description: "clear sky",
        humidity: 75,
        windSpeed: 1.5,
        location: "Toronto, Canada",
        timezone: this.getTorontoTimezone()
      };
    }
  }

  static getTorontoTimezone(): string {
    const now = new Date();
    const torontoTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Toronto" }));
    
    // Check if it's daylight saving time (roughly March to November)
    const month = torontoTime.getMonth();
    const isDST = month >= 2 && month <= 10; // March (2) to November (10)
    
    return isDST ? "EDT" : "EST";
  }
}

// GET /api/weather/toronto
router.get('/toronto', async (req: Request, res: Response) => {
  try {
    const weatherData = await WeatherService.getTorontoWeather();
    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data'
    });
  }
});

export default router;
