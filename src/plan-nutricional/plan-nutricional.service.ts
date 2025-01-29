import { Injectable } from '@nestjs/common';
import { CreatePlanNutricionalDto } from './dto/create-plan-nutricional.dto';
import { UpdatePlanNutricionalDto } from './dto/update-plan-nutricional.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanNutricional } from './entities/plan-nutricional.entity';
@Injectable()
export class PlanNutricionalService {
  constructor(
    @InjectRepository(PlanNutricional)
    private planNutricionalRepository: Repository<PlanNutricional>,
  ) {}

  create(createPlanNutricionalDto: CreatePlanNutricionalDto) {
    console.log(createPlanNutricionalDto);
    return 'This action adds a new planNutricional';
  }

  findByUser(id: number) {
    return this.planNutricionalRepository.find({ where: { paciente: { id } }, relations: ['nutricionista'] });
  }

  findOne(id: number) {
    return `This action returns a #${id} planNutricional`;
  }

  update(id: number, updatePlanNutricionalDto: UpdatePlanNutricionalDto) {
    console.log(updatePlanNutricionalDto);
    return `This action updates a #${id} planNutricional`;
  }

  remove(id: number) {
    return `This action removes a #${id} planNutricional`;
  }
}
