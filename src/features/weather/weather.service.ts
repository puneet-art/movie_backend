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

      return {
        city: data.name,
        temperature: data.main.temp,
        description: data.weather[0]?.description || '',
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      };
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

      return {
        city: data.city.name,
        forecast,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `Failed to fetch forecast for ${city}: ${message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
