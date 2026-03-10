import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SearchService } from '../features/search/search.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('IndexCLI');
  logger.log('Initializing application context for bulk indexing...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const searchService = app.get(SearchService);

    logger.log('Starting bulk indexing process...');
    const result = await searchService.bulkIndex();

    logger.log('Bulk indexing successful!');
    console.table(result);

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('Bulk indexing failed:', error.stack);
    process.exit(1);
  }
}

bootstrap();
