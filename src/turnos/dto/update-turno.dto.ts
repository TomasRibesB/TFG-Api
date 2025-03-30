import { PartialType } from '@nestjs/mapped-types';
import { CreateTurnoDto } from './create-turno.dto';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { EstadoTurno } from '../entities/estadosTurnos.enum';

export class UpdateTurnoDto extends PartialType(CreateTurnoDto) {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsOptional()
  @IsEnum(EstadoTurno)
  estado?: EstadoTurno;
}
