import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateTurnoDto {
  @IsNotEmpty()
  @IsDateString()
  fechaHora: Date;

  @IsOptional()
  @IsNumber()
  pacienteId?: number;
}
