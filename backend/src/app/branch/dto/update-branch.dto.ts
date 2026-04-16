import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Currency } from '../enums';

export class UpdateBranchDTO {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  addressText?: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;

  @IsString()
  @IsOptional()
  opensAt?: string;

  @IsString()
  @IsOptional()
  closesAt?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  deliveryRadius?: number;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsBoolean()
  @IsOptional()
  acceptOrders?: boolean;
}

export class UpdateBranchStatusDTO {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commission?: number;
}
