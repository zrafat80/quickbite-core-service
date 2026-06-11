import { IsIn, IsOptional } from 'class-validator';

export class HealthQueryDTO {
  @IsOptional()
  @IsIn(['database'])
  check?: string;
}
