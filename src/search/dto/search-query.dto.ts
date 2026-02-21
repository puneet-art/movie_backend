import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchQueryDto {
    @ApiProperty({ description: 'The search term', example: 'action' })
    @IsString()
    @IsNotEmpty()
    q: string;
}
