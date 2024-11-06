import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanNutricionalDto } from './create-plan-nutricional.dto';

export class UpdatePlanNutricionalDto extends PartialType(CreatePlanNutricionalDto) {}
