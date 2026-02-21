import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'typesense';

@Injectable()
export class TypesenseService implements OnModuleInit {
    private readonly logger = new Logger(TypesenseService.name);
    public client: Client;

    constructor(private configService: ConfigService) {
        this.client = new Client({
            nodes: [
                {
                    host: this.configService.get<string>('TYPESENSE_HOST', 'localhost'),
                    port: this.configService.get<number>('TYPESENSE_PORT', 8108),
                    protocol: this.configService.get<string>('TYPESENSE_PROTOCOL', 'http'),
                },
            ],
            apiKey: this.configService.get<string>('TYPESENSE_API_KEY', 'xyz'),
            connectionTimeoutSeconds: 5,
        });
    }

    async onModuleInit() {
        await this.initCollections();
    }

    private async initCollections() {
        try {
            // Check if films collection exists
            try {
                await this.client.collections('films').retrieve();
                this.logger.log('Films collection already exists.');
            } catch (e) {
                // If not found, Typesense throws an error, so we create it
                this.logger.log('Creating films collection...');
                await this.client.collections().create({
                    name: 'films',
                    fields: [
                        { name: 'film_id', type: 'string' },
                        { name: 'title', type: 'string' },
                        { name: 'description', type: 'string', optional: true },
                        { name: 'release_year', type: 'int32', optional: true },
                    ],
                });
                this.logger.log('Films collection created.');
            }

            // Check if actors collection exists
            try {
                await this.client.collections('actors').retrieve();
                this.logger.log('Actors collection already exists.');
            } catch (e) {
                this.logger.log('Creating actors collection...');
                await this.client.collections().create({
                    name: 'actors',
                    fields: [
                        { name: 'actor_id', type: 'string' },
                        { name: 'first_name', type: 'string' },
                        { name: 'last_name', type: 'string' },
                    ],
                });
                this.logger.log('Actors collection created.');
            }
        } catch (error) {
            this.logger.error('Error initializing Typesense collections', error);
        }
    }

    async indexFilms(films: any[]) {
        if (films.length === 0) return;
        const documents = films.map((f) => ({
            id: f.filmId.toString(),
            film_id: f.filmId.toString(),
            title: f.title,
            description: f.description || '',
            release_year: f.releaseYear || 0,
        }));
        await this.client.collections('films').documents().import(documents, { action: 'upsert' });
    }

    async indexActors(actors: any[]) {
        if (actors.length === 0) return;
        const documents = actors.map((a) => ({
            id: a.actorId.toString(),
            actor_id: a.actorId.toString(),
            first_name: a.firstName,
            last_name: a.lastName,
        }));
        await this.client.collections('actors').documents().import(documents, { action: 'upsert' });
    }
}
