import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength, IsEmail, MinLength, IsIn, Matches} from "class-validator";
import { Role } from "src/users/entities/role.enum";

export class RegisterDto {

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
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial',
    })
    password: string;

    @Transform(({ value }) => value.toLowerCase().trim())
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(50)
    email: string;

    @IsNotEmpty()
    @IsIn([Role.Usuario])
    role: Role = Role.Usuario;
}