import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanNutricionalDto } from './create-plan-nutricional.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdatePlanNutricionalDto extends PartialType(
  CreatePlanNutricionalDto,
) {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
