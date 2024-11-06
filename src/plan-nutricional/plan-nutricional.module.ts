import { Module } from '@nestjs/common';
import { PlanNutricionalService } from './plan-nutricional.service';
import { PlanNutricionalController } from './plan-nutricional.controller';

@Module({
  controllers: [PlanNutricionalController],
  providers: [PlanNutricionalService],
})
export class PlanNutricionalModule {}
