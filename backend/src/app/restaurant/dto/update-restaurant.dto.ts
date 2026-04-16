import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { RestaurantStatus } from '../enums'; // Adjust path if needed

export class UpdateRestaurantDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  logoURL?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  primaryCountry?: string;
}

export class UpdateRestaurantStatusDTO {
  @IsEnum(RestaurantStatus, {
    message: 'Status must be one of: active, suspended, disabled, pending',
  })
  @IsNotEmpty()
  status!: RestaurantStatus;
}
