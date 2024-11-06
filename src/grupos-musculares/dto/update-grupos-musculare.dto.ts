import { PartialType } from '@nestjs/mapped-types';
import { CreateGruposMusculareDto } from './create-grupos-musculare.dto';

export class UpdateGruposMusculareDto extends PartialType(CreateGruposMusculareDto) {}
