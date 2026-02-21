import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { TypesenseModule } from '../typesense/typesense.module';
import { Film } from '../film/film.entity';
import { Actor } from '../actor/actor.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Film, Actor]),
        TypesenseModule,
    ],
    controllers: [SearchController],
    providers: [SearchService],
})
export class SearchModule { }
