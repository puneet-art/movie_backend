import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from 'typesense';

@Injectable()
export class TypesenseService implements OnModuleInit {
  private readonly logger = new Logger(TypesenseService.name);
  public client: Client;

  constructor() {
    this.client = new Client({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST!,
          port: Number(process.env.TYPESENSE_PORT),
          protocol: process.env.TYPESENSE_PROTOCOL as 'http' | 'https',
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY!,
      connectionTimeoutSeconds: 5,
    });
  }

  async onModuleInit() {
    try {
      await this.ensureCollections();
      this.logger.log('✅ Typesense initialized successfully');
    } catch (error: any) {
      this.logger.error('❌ Typesense initialization failed:', error?.message);
    }
  }

  private async ensureCollections() {
    const collections = await this.client.collections().retrieve();
    const existingNames = collections.map((c: any) => c.name);

    // ===== FILMS COLLECTION =====
    const filmsCollection = collections.find((c: any) => c.name === 'films');
    const hasActorsField = filmsCollection?.fields?.some(
      (f: any) => f.name === 'actors',
    );

    if (!filmsCollection || !hasActorsField) {
      if (filmsCollection) {
        this.logger.log('Updating films collection schema...');
        await this.client.collections('films').delete();
      } else {
        this.logger.log('Creating films collection...');
      }

      await this.client.collections().create({
        name: 'films',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'film_id', type: 'int32' },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string', optional: true },
          { name: 'release_year', type: 'int32', optional: true },
          { name: 'genres', type: 'string[]', facet: true, optional: true },
          { name: 'actors', type: 'string[]', facet: true, optional: true },
        ],
        default_sorting_field: 'film_id',
      });
    }

    // ===== ACTORS COLLECTION =====
    const actorsCollection = collections.find((c: any) => c.name === 'actors');
    const hasFilmsField = actorsCollection?.fields?.some(
      (f: any) => f.name === 'films',
    );
    const hasLocationField = actorsCollection?.fields?.some(
      (f: any) => f.name === 'location',
    );
    const hasBioField = actorsCollection?.fields?.some(
      (f: any) => f.name === 'bio',
    );

    if (
      !actorsCollection ||
      !hasFilmsField ||
      !hasLocationField ||
      !hasBioField
    ) {
      if (actorsCollection) {
        this.logger.log('Updating actors collection schema...');
        await this.client.collections('actors').delete();
      } else {
        this.logger.log('Creating actors collection...');
      }

      await this.client.collections().create({
        name: 'actors',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'actor_id', type: 'int32' },
          { name: 'first_name', type: 'string' },
          { name: 'last_name', type: 'string' },
          { name: 'bio', type: 'string', optional: true },
          { name: 'location', type: 'string', optional: true },
          { name: 'films', type: 'string[]', facet: true, optional: true },
        ],
        default_sorting_field: 'actor_id',
      });
    }
  }

  async indexFilms(films: any[]) {
    if (!films.length) return;

    const documents = films.map((film: any) => ({
      id: film.film_id.toString(),
      film_id: Number(film.film_id),
      title: film.title,
      description: film.description,
      release_year: film.release_year ?? 0,
      genres: film.genres || [],
      actors: film.actors || [],
    }));

    await this.client
      .collections('films')
      .documents()
      .import(documents, { action: 'upsert' });

    this.logger.log('🎬 Films indexed successfully');
  }

  async indexActors(actors: any[]) {
    if (!actors.length) return;

    const documents = actors.map((actor: any) => ({
      id: actor.actor_id.toString(),
      actor_id: Number(actor.actor_id),
      first_name: actor.first_name,
      last_name: actor.last_name,
      bio: actor.bio || '',
      location: actor.location || '',
      films: actor.films || [],
    }));

    await this.client
      .collections('actors')
      .documents()
      .import(documents, { action: 'upsert' });

    this.logger.log('🎭 Actors indexed successfully');
  }
}
