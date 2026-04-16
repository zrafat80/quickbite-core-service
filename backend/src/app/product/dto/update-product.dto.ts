import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class UpdateProductDTO {
  // Global Product Fields
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  categoryName?: string;

  // Branch-Specific Fields (Only used if branchId is in query params)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
