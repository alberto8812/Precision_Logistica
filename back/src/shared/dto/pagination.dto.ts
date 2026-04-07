import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export type FilterOperator = 'equals' | 'contains' | 'in' | 'gt' | 'lt';

export class FilterDto {
  @ApiProperty({ example: 'title', description: 'field to filter by' })
  @IsString()
  field: string;

  @ApiPropertyOptional({ example: 'equals', description: 'operator to use for filtering' })
  @IsString()
  @IsOptional()
  operator?: FilterOperator;

  @ApiProperty({ example: 'The Great Gatsby', description: 'value to filter by' })
  @IsString()
  Value: string;
}

export class PaginationDto {
  @ApiPropertyOptional({ example: 20, description: 'number of items to return' })
  @IsNumber()
  @IsOptional()
  limit?: number = 20; // Default to 20 if not provided

  @ApiPropertyOptional({ example: 'cursor123', description: 'cursor for pagination' })
  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: string | null }) =>
    value === null ? undefined : value,
  )
  afterCursor?: string | undefined;

  @ApiPropertyOptional({ example: 'cursor123', description: 'cursor for pagination' })
  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: string | null }) =>
    value === null ? undefined : value,
  )
  beforeCursor?: string | undefined;

  @ApiPropertyOptional({ example: 'search term', description: 'search term for filtering' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: [{ field: 'title', operator: 'equals', value: 'The Great Gatsby' }], description: 'filters to apply' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filters?: FilterDto[];
}
