import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength, IsObject, IsInt, IsDate, IsOptional } from "class-validator";
import { Routine } from "src/routines/entities/routine.entity";
import { Ejercicio } from "src/ejercicios/entities/ejercicio.entity";

export class CreateRutinaEjercicioDto {
    
        @IsObject()
        @IsNotEmpty()
        routine: Routine;
    
        @IsObject()
        @IsNotEmpty()
        ejercicio: Ejercicio;
    
        @IsInt()
        @IsNotEmpty()
        series: number;
    
        @IsInt()
        @IsNotEmpty()
        repeticiones: number;

        @IsString()
        @IsOptional()
        @MaxLength(50)
        @Transform(({ value }) => value.trim().toUpperCase())
        medicion: string;

        @IsDate()
        fecha: Date= new Date();

}
