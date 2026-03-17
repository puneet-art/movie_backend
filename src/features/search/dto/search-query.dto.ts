import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @ApiProperty({
    description: 'The search term',
    example: 'action',
    required: false,
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiProperty({
    description: 'Number of results to return per page',
    example: 20,
    required: false,
    default: 20,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100) // Restricted max limit for better performance
  limit?: number = 20;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Filter by genre/category',
    example: 'Action',
    required: false,
  })
  @IsString()
  @IsOptional()
  genre?: string;

  @ApiProperty({
    description: 'Filter by release year',
    example: 2023,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  year?: number;

  @ApiProperty({
    description: 'Sort method',
    example: 'latest',
    required: false,
    enum: ['latest', 'oldest', 'relevance'],
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'relevance';
}
