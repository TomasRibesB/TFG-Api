import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength, IsEmail, IsOptional, MinLength, IsBoolean} from "class-validator";

export class CreateUserDto {

    @Transform(({ value }) => value.toLowerCase())
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    nombre: string;

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
    role: string;

    @IsOptional()
    @IsBoolean()
    isMuted: boolean;
}