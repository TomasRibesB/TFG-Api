import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength, MinLength, IsEmail} from "class-validator";

export class LoginDto {

    @Transform(({ value }) => value.toLowerCase().trim())
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(50)
    email: string;

    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @MinLength(6)
    password: string;
}