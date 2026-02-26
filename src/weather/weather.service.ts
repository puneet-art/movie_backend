import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ky from 'ky';

@Injectable()
export class WeatherService {
    private apiKey: string;
    private baseUrl = 'https://api.openweathermap.org/data/2.5';

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('OPENWEATHERMAP_API_KEY', '');
    }

    async getCurrentWeather(city: string): Promise<any> {
        if (!this.apiKey) {
            throw new HttpException('OpenWeatherMap API Key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        try {
            const data = await ky.get(`${this.baseUrl}/weather`, {
                searchParams: {
                    q: city,
                    appid: this.apiKey,
                    units: 'metric',
                },
            }).json();
            return data;
        } catch (error: any) {
            throw new HttpException(`Failed to fetch weather for ${city}: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    async getForecastWeather(city: string): Promise<any> {
        if (!this.apiKey) {
            throw new HttpException('OpenWeatherMap API Key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        try {
            const data = await ky.get(`${this.baseUrl}/forecast`, {
                searchParams: {
                    q: city,
                    appid: this.apiKey,
                    units: 'metric',
                },
            }).json();
            return data;
        } catch (error: any) {
            throw new HttpException(`Failed to fetch forecast for ${city}: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }
}
