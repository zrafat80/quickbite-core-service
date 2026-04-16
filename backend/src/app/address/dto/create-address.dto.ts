import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class CreateAddressDTO {
  @IsString()
  @IsNotEmpty()
  label!: string; // <-- Add ! here

  @IsString()
  @IsNotEmpty()
  country!: string; // <-- Add ! here

  @IsString()
  @IsNotEmpty()
  city!: string; // <-- Add ! here

  @IsString()
  @IsNotEmpty()
  street!: string; // <-- Add ! here

  @IsString()
  @IsOptional()
  building!: string; // <-- Add ! here

  @IsOptional()
  @IsString()
  apartmentNumber?: string; // Optional properties use ? instead of !

  @IsString()
  @IsNotEmpty()
  type!: string; // <-- Add ! here

  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsNotEmpty()
  lat!: number; // <-- Add ! here

  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsNotEmpty()
  lng!: number; // <-- Add ! here

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}