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

  async remove(id: number, nutricionistaId: number): Promise<void> {
    //le pongo fecha de baja, primero hago un find para ver si existe y el nutricionista es el mismo
    const plan = await this.planNutricionalRepository.findOne({
      where: { id, nutricionista: { id: nutricionistaId } },
    });
    if (!plan) {
      throw new NotFoundException(
        `Plan Nutricional con id ${id} no encontrado o no pertenece al nutricionista`,
      );
    }
    plan.fechaBaja = new Date();
    await this.planNutricionalRepository.save(plan);
  }

  findByUser(id: number) {
    return this.planNutricionalRepository.find({
      where: { paciente: { id }, fechaBaja: null },
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
}
