import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(
    createPlanNutricionalDto: CreatePlanNutricionalDto,
    nutricionistaId: number,
  ): Promise<PlanNutricional> {
    const plan = this.planNutricionalRepository.create(
      createPlanNutricionalDto,
    );
    plan.nutricionista = { id: nutricionistaId } as any;
    return await this.planNutricionalRepository.save(plan);
  }

  async update(
    updatePlanNutricionalDto: UpdatePlanNutricionalDto,
    nutricinistaId: number,
  ): Promise<PlanNutricional> {
    try {
      const plan = await this.planNutricionalRepository.findOne({
        where: { id: updatePlanNutricionalDto.id },
      });
      if (!plan) {
        throw new NotFoundException(
          `Plan Nutricional con id ${updatePlanNutricionalDto.id} no encontrado`,
        );
      }
      const planActualizado = Object.assign(plan, updatePlanNutricionalDto);
      planActualizado.nutricionista = { id: nutricinistaId } as any;
      return await this.planNutricionalRepository.save(planActualizado);
    } catch (error) {
      console.log(error);
    }
  }

  findByUser(id: number) {
    return this.planNutricionalRepository.find({
      where: { paciente: { id } },
      relations: ['nutricionista'],
    });
  }

  async findForNutricionistByUser(
    nutricionistId: number,
    userId: number,
  ): Promise<PlanNutricional[]> {
    return this.planNutricionalRepository.find({
      where: {
        nutricionista: { id: nutricionistId },
        paciente: { id: userId },
      },
    });
  }

  async findOne(id: number): Promise<PlanNutricional> {
    const plan = await this.planNutricionalRepository.findOne({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException(
        `Plan Nutricional con id ${id} no encontrado`,
      );
    }
    return plan;
  }

  async remove(id: number): Promise<void> {
    await this.planNutricionalRepository.delete(id);
  }
}
