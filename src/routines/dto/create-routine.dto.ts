import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Ejercicio } from 'src/ejercicios/entities/ejercicio.entity';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';
export class CreateRoutineDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase())
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  ejercicios?: Ejercicio[];

  @IsOptional()
  ejerciciosRegistros?: RutinaEjercicio[];
}
