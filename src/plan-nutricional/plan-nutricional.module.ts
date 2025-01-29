import { Module } from '@nestjs/common';
import { PlanNutricionalService } from './plan-nutricional.service';
import { PlanNutricionalController } from './plan-nutricional.controller';
import { PlanNutricional } from './entities/plan-nutricional.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PlanNutricional])],
  controllers: [PlanNutricionalController],
  providers: [PlanNutricionalService],
})
export class PlanNutricionalModule {}
