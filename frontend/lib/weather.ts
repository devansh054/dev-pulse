interface WeatherData {
  temperature: string;
  weather: string;
  description: string;
  humidity: number;
  windSpeed: number;
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

export class WeatherService {
  static async getTorontoWeather(): Promise<WeatherData> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/weather/toronto`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Weather API returned error');
      }
      
      return {
        temperature: result.data.temperature,
        weather: result.data.weather,
        description: result.data.description,
        humidity: result.data.humidity,
        windSpeed: result.data.windSpeed
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
        windSpeed: 3.2
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        temperature: "24°C",
        weather: "Sunny",
        description: "sunny",
        humidity: 55,
        windSpeed: 2.8
      };
    } else if (hour >= 18 && hour < 22) {
      return {
        temperature: "21°C",
        weather: "Partly Cloudy",
        description: "few clouds",
        humidity: 70,
        windSpeed: 2.1
      };
    } else {
      return {
        temperature: "16°C",
        weather: "Clear",
        description: "clear sky",
        humidity: 75,
        windSpeed: 1.5
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
