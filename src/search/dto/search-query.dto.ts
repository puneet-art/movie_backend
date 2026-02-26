import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchQueryDto {
    @ApiProperty({ description: 'The search term', example: 'action', required: false })
    @IsString()
    @IsOptional()
    q?: string;

    @ApiProperty({ description: 'Number of results to return', example: 1000, required: false, default: 1000 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(1000)
    limit?: number = 1000;

    @ApiProperty({ description: 'Page number', example: 1, required: false, default: 1 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;
}
