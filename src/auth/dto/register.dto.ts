import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength, IsEmail, MinLength, IsBoolean, IsIn} from "class-validator";

export class RegisterDto {

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

    @IsNotEmpty()
    @IsString()
    @IsIn(['user'])
    role: string = 'user';

    @IsNotEmpty()
    @IsBoolean()
    isMuted: boolean = false;
}