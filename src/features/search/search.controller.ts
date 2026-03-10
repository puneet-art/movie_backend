import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
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
    async searchFilms(@Query(ValidationPipe) query: SearchQueryDto) {
        // Explicitly use page, limit, and q from query object
        return this.searchService.searchFilms(query.q, query.limit, query.page);
    }

    @Get('actors')
    @ApiOperation({ summary: 'Search actors by name' })
    @ApiResponse({ status: 200, description: 'List of matching actors.' })
    async searchActors(@Query(ValidationPipe) query: SearchQueryDto) {
        return this.searchService.searchActors(query.q, query.limit, query.page);
    }
}
