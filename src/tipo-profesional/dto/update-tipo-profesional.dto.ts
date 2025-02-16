import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoProfesionalDto } from './create-tipo-profesional.dto';

export class UpdateTipoProfesionalDto extends PartialType(CreateTipoProfesionalDto) {}
