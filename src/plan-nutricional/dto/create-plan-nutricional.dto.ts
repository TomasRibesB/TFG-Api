// create-plan-nutricional.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';

export class CreatePlanNutricionalDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsNotEmpty()
  @IsNumber()
  pacienteId: number;

  @IsNotEmpty()
  @IsString()
  objetivos: string;

  @IsNotEmpty()
  @IsNumber()
  caloriasDiarias: number;

  @IsNotEmpty()
  @IsObject()
  macronutrientes: { [key: string]: number };

  @IsOptional()
  @IsString()
  notasAdicionales?: string;
}
