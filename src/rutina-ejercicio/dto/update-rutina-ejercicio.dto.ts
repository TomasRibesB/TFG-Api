import { PartialType } from '@nestjs/mapped-types';
import { CreateRutinaEjercicioDto } from './create-rutina-ejercicio.dto';

export class UpdateRutinaEjercicioDto extends PartialType(CreateRutinaEjercicioDto) {}
//No se debe modificar