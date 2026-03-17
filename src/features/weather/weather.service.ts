import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ky from 'ky';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    description: string;
  }[];
  wind: {
    speed: number;
  };
}

interface ForecastItem {
  dt_txt: string;
  main: {
    temp: number;
  };
  weather: {
    description: string;
  }[];
}

interface ForecastData {
  city: {
    name: string;
  };
  list: ForecastItem[];
}

@Injectable()
export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private readonly CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
  
  // In-built memory cache
  private cache = new Map<string, { data: any; expiry: number }>();

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENWEATHERMAP_API_KEY', '');
  }

  async getCurrentWeather(city: string): Promise<any> {
    if (!this.apiKey) {
      throw new HttpException(
        'OpenWeatherMap API Key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const cacheKey = `weather_current_${city.toLowerCase()}`;
    const cachedItem = this.cache.get(cacheKey);
    
    if (cachedItem && Date.now() < cachedItem.expiry) {
      return cachedItem.data;
    }

    try {
      const data = await ky
        .get(`${this.baseUrl}/weather`, {
          searchParams: {
            q: city,
            appid: this.apiKey,
            units: 'metric',
          },
        })
        .json<WeatherData>();

      const result = {
        city: data.name,
        temperature: data.main.temp,
        description: data.weather[0]?.description || '',
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      };

      this.cache.set(cacheKey, {
        data: result,
        expiry: Date.now() + this.CACHE_TTL,
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `Failed to fetch weather for ${city}: ${message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getForecastWeather(city: string): Promise<any> {
    if (!this.apiKey) {
      throw new HttpException(
        'OpenWeatherMap API Key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const cacheKey = `weather_forecast_${city.toLowerCase()}`;
    const cachedItem = this.cache.get(cacheKey);
    
    if (cachedItem && Date.now() < cachedItem.expiry) {
      return cachedItem.data;
    }

    try {
      const data = await ky
        .get(`${this.baseUrl}/forecast`, {
          searchParams: {
            q: city,
            appid: this.apiKey,
            units: 'metric',
          },
        })
        .json<ForecastData>();

      const forecast = data.list
        .filter((_: unknown, index: number) => index % 8 === 0) // Every 24 hours (8 * 3h blocks)
        .map((item: ForecastItem) => ({
          date: item.dt_txt,
          temperature: item.main.temp,
          description: item.weather[0]?.description || '',
        }));

      const result = {
        city: data.city.name,
        forecast,
      };

      this.cache.set(cacheKey, {
        data: result,
        expiry: Date.now() + this.CACHE_TTL,
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `Failed to fetch forecast for ${city}: ${message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
