import { Injectable, Logger } from '@nestjs/common';
import { TypesenseService } from '../../typesense/typesense.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Film, Actor } from '@prisma/client';

interface TypesenseSearchHit<T> {
  document: T;
}

interface TypesenseSearchResult<T> {
  hits?: TypesenseSearchHit<T>[];
}

export interface FilmWithGenres extends Film {
  genres: string[];
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private prisma: PrismaService,
    private typesenseService: TypesenseService,
  ) { }

  async bulkIndex() {
    this.logger.log('Starting bulk indexing...');
    // @ts-ignore
    const filmsData = await this.prisma.film.findMany({
      include: {
        film_category: {
          include: {
            category: true,
          },
        },
        film_actor: {
          include: {
            actor: true,
          },
        },
      },
    }) as any[];

    const filmsToIndex = filmsData.map((film: any) => ({
      ...film,
      genres: film.film_category.map((fc: any) => fc.category.name),
      actors: film.film_actor.map((fa: any) => `${fa.actor.first_name} ${fa.actor.last_name}`),
    }));

    if (filmsToIndex.length > 0) {
      await this.typesenseService.indexFilms(filmsToIndex);
    }

    // @ts-ignore
    const actorsData = await this.prisma.actor.findMany({
      include: {
        film_actor: {
          include: {
            film: true,
          },
        },
      },
    }) as any[];

    const actorsToIndex = actorsData.map((actor: any) => ({
      ...actor,
      films: actor.film_actor.map((fa: any) => fa.film.title),
    }));

    if (actorsToIndex.length > 0) {
      await this.typesenseService.indexActors(actorsToIndex);
    }

    this.logger.log('Bulk indexing completed.');
    return {
      success: true,
      filmsIndexed: filmsToIndex.length,
      actorsIndexed: actorsToIndex.length,
    };
  }

  async searchFilms(q?: string, limit: number = 20, page: number = 1, genre?: string, year?: number, sortBy?: string) {
    this.logger.log(`searchFilms params: q="${q}", limit=${limit}, page=${page}, genre="${genre}", year=${year}, sortBy="${sortBy}"`);
    const query = q || '*';
    const perPage = Number(limit) || 20;
    const currentPage = Number(page) || 1;

    const filters: string[] = [];
    if (genre) filters.push(`genres:=${genre}`);
    if (year) filters.push(`release_year:=${year}`);
    const filterBy = filters.join(' && ');

    let sort_by = '_text_match:desc';
    if (sortBy === 'latest') sort_by = 'release_year:desc';
    else if (sortBy === 'oldest') sort_by = 'release_year:asc';

    this.logger.log(`Typesense search (films): q="${query}", per_page=${perPage}, page=${currentPage}`);
    const result = (await this.typesenseService.client
      .collections('films')
      .documents()
      .search({
        q: query,
        query_by: 'title,genres,actors',
        filter_by: filterBy,
        sort_by: sort_by,
        per_page: perPage,
        page: currentPage,
      })) as any;
    
    this.logger.log(`Raw Typesense results hits length: ${result.hits?.length || 0}`);

    const total = result.found || 0;
    const totalPages = Math.ceil(total / perPage);

    const response = {
      data: result.hits?.map((h: any) => h.document) || [],
      meta: {
        total,
        page: currentPage,
        per_page: perPage,
        total_pages: totalPages,
        has_next_page: currentPage < totalPages,
        has_previous_page: currentPage > 1,
      }
    };

    this.logger.log(`Search films returning ${response.data.length} items. Total: ${total}`);
    return response;
  }

  async searchActors(q?: string, limit: number = 20, page: number = 1) {
    const query = q || '*';
    const perPage = Number(limit) || 20;
    const currentPage = Number(page) || 1;

    this.logger.log(`Typesense search (actors): q="${query}", per_page=${perPage}, page=${currentPage}`);
    const result = (await this.typesenseService.client
      .collections('actors')
      .documents()
      .search({
        q: query,
        query_by: 'first_name,last_name,bio,location,films',
        per_page: perPage,
        page: currentPage,
      })) as any;

    const total = result.found || 0;
    const totalPages = Math.ceil(total / perPage);

    return {
      data: result.hits?.map((h: any) => h.document) || [],
      meta: {
        total,
        page: currentPage,
        per_page: perPage,
        total_pages: totalPages,
        has_next_page: currentPage < totalPages,
        has_previous_page: currentPage > 1,
      }
    };
  }

  async searchAll(q?: string, limit: number = 20, page: number = 1, genre?: string, year?: number, sortBy?: string) {
    const query = q || '*';
    const perPage = Number(limit) || 20;
    const currentPage = Number(page) || 1;

    const filters: string[] = [];
    if (genre) filters.push(`genres:=${genre}`);
    if (year) filters.push(`release_year:=${year}`);
    const filterBy = filters.join(' && ');

    let sort_by = '_text_match:desc';
    if (sortBy === 'latest') sort_by = 'release_year:desc';
    else if (sortBy === 'oldest') sort_by = 'release_year:asc';

    const searchRequests = {
      searches: [
        {
          collection: 'films',
          q: query,
          query_by: 'title,genres,actors',
          filter_by: filterBy,
          sort_by: sort_by,
          per_page: perPage,
          page: currentPage,
        },
        {
          collection: 'actors',
          q: query,
          query_by: 'first_name,last_name,bio,location,films',
          per_page: perPage,
          page: currentPage,
        },
      ],
    };

    this.logger.log(`Typesense multiSearch: q="${query}", limit=${perPage}, page=${currentPage}, genre="${genre}", year="${year}"`);

    const result: any = await this.typesenseService.client.multiSearch.perform(
      searchRequests
    );

    const filmsResult = result.results[0];
    const actorsResult = result.results[1];

    const filmsTotal = filmsResult.found || 0;
    const filmsTotalPages = Math.ceil(filmsTotal / perPage);

    const actorsTotal = actorsResult.found || 0;
    const actorsTotalPages = Math.ceil(actorsTotal / perPage);

    return {
      films: {
        data: filmsResult.hits?.map((h: any) => h.document) || [],
        meta: {
          total: filmsTotal,
          page: currentPage,
          per_page: perPage,
          total_pages: filmsTotalPages,
          has_next_page: currentPage < filmsTotalPages,
          has_previous_page: currentPage > 1,
        }
      },
      actors: {
        data: actorsResult.hits?.map((h: any) => h.document) || [],
        meta: {
          total: actorsTotal,
          page: currentPage,
          per_page: perPage,
          total_pages: actorsTotalPages,
          has_next_page: currentPage < actorsTotalPages,
          has_previous_page: currentPage > 1,
        }
      },
    };
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getActorById(id: number) {
    const actor = await this.prisma.actor.findUnique({
      where: { actor_id: id },
    });

    if (!actor) return null;

    // @ts-ignore
    const filmActors = await this.prisma.film_actor.findMany({
      where: { actor_id: id },
      include: {
        film: true,
      },
    }) as any[];

    const films = filmActors.map((fa: any) => fa.film);

    return {
      ...actor,
      films,
    };
  }

  async getFilmById(id: number) {
    // @ts-ignore
    const film = await this.prisma.film.findUnique({
      where: { film_id: id },
      include: {
        film_category: {
          include: {
            category: true,
          },
        },
        film_actor: {
          include: {
            actor: true,
          },
        },
      },
    });

    if (!film) return null;

    const genres = film.film_category.map((fc: any) => fc.category.name);
    const actors = film.film_actor.map((fa: any) => ({
      actor_id: fa.actor.actor_id,
      first_name: fa.actor.first_name,
      last_name: fa.actor.last_name,
    }));

    const { film_category, film_actor, ...filmData } = film as any;

    return {
      ...filmData,
      genres,
      actors,
    };
  }
}

