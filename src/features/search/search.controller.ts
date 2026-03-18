import { Controller, Get, Param, ParseIntPipe, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get('films')
    @ApiOperation({ summary: 'Search films by title' })
    @ApiResponse({ status: 200, description: 'List of matching films.' })
    async searchFilms(@Query() query: SearchQueryDto) {
        // Explicitly use page, limit, and q from query object
        return this.searchService.searchFilms(query.q, query.limit, query.page, query.genre, query.year, query.sortBy);
    }

    @Get('films/:id')
    @ApiOperation({ summary: 'Get film details by ID' })
    @ApiResponse({ status: 200, description: 'Film details with cast and genres.' })
    async getFilm(@Param('id', ParseIntPipe) id: number) {
        return this.searchService.getFilmById(id);
    }

    @Get('actors')
    @ApiOperation({ summary: 'Search actors by name' })
    @ApiResponse({ status: 200, description: 'List of matching actors.' })
    async searchActors(@Query() query: SearchQueryDto) {
        console.log('[API Controller] /search/actors query:', JSON.stringify(query));
        return this.searchService.searchActors(query.q, query.limit, query.page);
    }

    @Get('all')
    @ApiOperation({ summary: 'Global search for films and actors simultaneously' })
    @ApiResponse({ status: 200, description: 'Combined results for films and actors.' })
    async searchAll(@Query() query: SearchQueryDto) {
        console.log('[API Controller] /search/all query:', JSON.stringify(query));
        return this.searchService.searchAll(query.q, query.limit, query.page, query.genre, query.year, query.sortBy);
    }

    @Get('categories')
    @ApiOperation({ summary: 'Get all movie categories' })
    @ApiResponse({ status: 200, description: 'List of categories.' })
    async getCategories() {
        return this.searchService.getCategories();
    }

    @Get('actors/:id')
    @ApiOperation({ summary: 'Get actor details by ID' })
    @ApiResponse({ status: 200, description: 'Actor details with filmography.' })
    async getActor(@Param('id', ParseIntPipe) id: number) {
        return this.searchService.getActorById(id);
    }
}
