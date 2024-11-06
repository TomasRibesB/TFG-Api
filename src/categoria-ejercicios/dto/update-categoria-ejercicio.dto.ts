import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaEjercicioDto } from './create-categoria-ejercicio.dto';

export class UpdateCategoriaEjercicioDto extends PartialType(CreateCategoriaEjercicioDto) {}
