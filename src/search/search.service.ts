import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypesenseService } from '../typesense/typesense.service';
import { Film } from '../film/film.entity';
import { Actor } from '../actor/actor.entity';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        @InjectRepository(Film) private filmRepository: Repository<Film>,
        @InjectRepository(Actor) private actorRepository: Repository<Actor>,
        private typesenseService: TypesenseService,
    ) { }

    async bulkIndex() {
        this.logger.log('Starting bulk indexing...');
        const films = await this.filmRepository.find();
        if (films.length > 0) {
            await this.typesenseService.indexFilms(films);
        }

        const actors = await this.actorRepository.find();
        if (actors.length > 0) {
            await this.typesenseService.indexActors(actors);
        }
        this.logger.log('Bulk indexing completed.');
        return { success: true, filmsIndexed: films.length, actorsIndexed: actors.length };
    }

    async searchFilms(q: string) {
        if (!q) {
            return [];
        }
        const result = await this.typesenseService.client.collections('films').documents().search({
            q,
            query_by: 'title',
        });
        return result.hits?.map((h) => h.document) || [];
    }

    async searchActors(q: string) {
        if (!q) {
            return [];
        }
        const result = await this.typesenseService.client.collections('actors').documents().search({
            q,
            query_by: 'first_name,last_name',
        });
        return result.hits?.map((h) => h.document) || [];
    }
}
