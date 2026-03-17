import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { AdminController } from './admin.controller';
import { SearchService } from './search.service';
import { TypesenseModule } from '../../typesense/typesense.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, TypesenseModule],
  controllers: [SearchController, AdminController],
  providers: [SearchService],
})
export class SearchModule { }
