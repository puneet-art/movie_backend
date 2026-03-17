import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly searchService: SearchService) { }

    @Post('sync')
    @ApiOperation({ summary: 'Trigger manual synchronization of database with Typesense' })
    @ApiResponse({ status: 200, description: 'Sync completed successfully.' })
    async syncData() {
        return this.searchService.bulkIndex();
    }
}
