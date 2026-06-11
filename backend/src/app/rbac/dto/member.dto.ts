import {
  ArrayUnique,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsInt,
  IsIn,
  Matches,
  Min,
} from 'class-validator';

export class RoleNameParamDTO {
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/)
  role!: string;
}

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
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  branchIds!: number[];
}

export class UpdateMemberDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
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
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  branchIds!: number[];
}
