import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsEmail,
  IsOptional,
  MinLength,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Role } from '../entities/role.enum';

export class CreateUserProfesionalDto {
  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  firstName: string;

  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  lastName: string;

  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  dni: string;

  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @MinLength(6)
  password: string;

  @Transform(({ value }) => value.toLowerCase().trim())
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  // Solo se requiere el id de TipoProfesional
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  tipoProfesionalIds?: number[];

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  emailVerificationToken?: string;

  @IsOptional()
  @IsString()
  registerVerificationToken?: string;

  @IsOptional()
  @IsString()
  resetPasswordToken?: string;
}
