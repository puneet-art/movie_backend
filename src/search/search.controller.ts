import { Controller, Get, Post, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Post('index')
    @ApiOperation({ summary: 'One-time bulk indexing process of films and actors into Typesense' })
    @ApiResponse({ status: 200, description: 'Bulk indexing completed successfully.' })
    async bulkIndex() {
        return this.searchService.bulkIndex();
    }

    @Get('films')
    @ApiOperation({ summary: 'Search films by title' })
    @ApiResponse({ status: 200, description: 'List of matching films.' })
    async searchFilms(@Query(ValidationPipe) query: SearchQueryDto) {
        return this.searchService.searchFilms(query.q);
    }

    @Get('actors')
    @ApiOperation({ summary: 'Search actors by name' })
    @ApiResponse({ status: 200, description: 'List of matching actors.' })
    async searchActors(@Query(ValidationPipe) query: SearchQueryDto) {
        return this.searchService.searchActors(query.q);
    }
}
