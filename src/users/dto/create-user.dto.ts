import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength, IsEmail, IsOptional, MinLength, IsIn} from "class-validator";
import { Role } from "../entities/role.enum";

export class CreateUserDto {

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
    dni: string

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

    @IsOptional()
    @Transform(({ value }) => value.toLowerCase())
    @IsString()
    @MaxLength(50)
    @IsIn(Object.values(Role))
    role: Role;

}