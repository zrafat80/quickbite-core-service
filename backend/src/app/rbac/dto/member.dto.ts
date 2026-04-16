import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsISIN,
  IsInt,
  IsIn,
} from 'class-validator';

export class CreateMemberDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  role!: string;

  @IsArray()
  @IsOptional()
  branchIds!: number[];
}
export class UpdateMemberDTO {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'suspended'], {
    message: 'Status must be exactly: active, inactive, or suspended',
  })
  status?: string;
}

export class UpdateMemberBranchesDTO {
  @IsArray({ message: 'branchIds must be an array' })
  branchIds!: number[];
}
