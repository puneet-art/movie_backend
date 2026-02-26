import { Injectable, Logger } from '@nestjs/common';
import { TypesenseService } from '../typesense/typesense.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private prisma: PrismaService,
        private typesenseService: TypesenseService,
    ) { }

    async bulkIndex() {
        this.logger.log('Starting bulk indexing...');
        const filmsData = await (this.prisma.film as any).findMany({
            include: {
                film_category: {
                    include: {
                        category: true
                    }
                }
            }
        });

        const filmsToIndex = filmsData.map((film: any) => ({
            ...film,
            genres: film.film_category.map((fc: any) => fc.category.name)
        }));

        if (filmsToIndex.length > 0) {
            await this.typesenseService.indexFilms(filmsToIndex);
        }

        const actors = await this.prisma.actor.findMany();
        if (actors.length > 0) {
            await this.typesenseService.indexActors(actors);
        }
        this.logger.log('Bulk indexing completed.');
        return { success: true, filmsIndexed: filmsToIndex.length, actorsIndexed: actors.length };
    }

    async searchFilms(q?: string, limit: number = 1000, page: number = 1) {
        const query = q || '*';
        const perPage = 250;
        const totalRequired = limit;
        let allDocuments = [];

        // Typesense has a hard limit of 250 per_page. To get more, we fetch multiple pages.
        const pagesToFetch = Math.ceil(totalRequired / perPage);

        for (let p = 1; p <= pagesToFetch; p++) {
            const result = await this.typesenseService.client.collections('films').documents().search({
                q: query,
                query_by: 'title,genres',
                per_page: perPage,
                page: p,
            });

            if (result.hits) {
                allDocuments.push(...result.hits.map((h: any) => h.document));
            }

            if (!result.hits || result.hits.length < perPage) break;
            if (allDocuments.length >= totalRequired) break;
        }

        return allDocuments.slice(0, totalRequired);
    }

    async searchActors(q?: string, limit: number = 1000, page: number = 1) {
        const query = q || '*';
        const perPage = 250;
        const totalRequired = limit;
        let allDocuments = [];

        const pagesToFetch = Math.ceil(totalRequired / perPage);

        for (let p = 1; p <= pagesToFetch; p++) {
            const result = await this.typesenseService.client.collections('actors').documents().search({
                q: query,
                query_by: 'first_name,last_name',
                per_page: perPage,
                page: p,
            });

            if (result.hits) {
                allDocuments.push(...result.hits.map((h: any) => h.document));
            }

            if (!result.hits || result.hits.length < perPage) break;
            if (allDocuments.length >= totalRequired) break;
        }

        return allDocuments.slice(0, totalRequired);
    }
}
