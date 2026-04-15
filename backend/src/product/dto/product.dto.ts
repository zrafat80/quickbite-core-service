import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProductDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  categoryName?: string; // We take a string, not an ID, to make UX easier!
}