import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchModule } from './features/search/search.module';
import { TypesenseModule } from './typesense/typesense.module';
import { WeatherModule } from './features/weather/weather.module';
import { PrismaModule } from './prisma/prisma.module';
import { TimingMiddleware } from './common/middleware/timing.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    TypesenseModule,
    SearchModule,
    WeatherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TimingMiddleware).forRoutes('*');
  }
}
