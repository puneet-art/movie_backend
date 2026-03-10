import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WeatherService } from './weather.service';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current/:city')
  @ApiOperation({ summary: 'Get current weather by city' })
  @ApiResponse({ status: 200, description: 'Current weather data.' })
  async getCurrentWeather(@Param('city') city: string) {
    return this.weatherService.getCurrentWeather(city);
  }

  @Get('forecast/:city')
  @ApiOperation({ summary: 'Get 5-day weather forecast by city' })
  @ApiResponse({ status: 200, description: '5-day weather forecast.' })
  async getForecastWeather(@Param('city') city: string) {
    return this.weatherService.getForecastWeather(city);
  }
}
