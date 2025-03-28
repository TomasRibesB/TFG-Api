import { Ejercicio } from "src/ejercicios/entities/ejercicio.entity";
import { RutinaEjercicio } from "src/rutina-ejercicio/entities/rutina-ejercicio.entity";
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsNumber } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateRoutineDto {
    
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.toUpperCase())
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsOptional()
    ejercicios?: Ejercicio[];

    @IsOptional()
    ejerciciosRegistros?: RutinaEjercicio[];
}
