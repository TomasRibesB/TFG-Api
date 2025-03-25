import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanNutricionalDto } from './dto/create-plan-nutricional.dto';
import { UpdatePlanNutricionalDto } from './dto/update-plan-nutricional.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { PlanNutricional } from './entities/plan-nutricional.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PlanNutricionalService {
  constructor(
    @InjectRepository(PlanNutricional)
    private planNutricionalRepository: Repository<PlanNutricional>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  async remove(id: number, nutricionistaId: number) {
    //le pongo fecha de baja, primero hago un find para ver si existe y el nutricionista es el mismo
    const plan = await this.planNutricionalRepository.findOne({
      where: { id, nutricionista: { id: nutricionistaId } },
    });
    if (!plan) {
      throw new NotFoundException(
        `Plan Nutricional con id ${id} no encontrado o no pertenece al nutricionista`,
      );
    }
    if (plan.fechaBaja) {
      plan.fechaBaja = null;
    } else {
      plan.fechaBaja = new Date();
    }
    return this.planNutricionalRepository.save(plan);
  }

  findByUser(id: number) {
    return this.planNutricionalRepository.find({
      where: { paciente: { id }, fechaBaja: null },
      relations: ['nutricionista', 'visibilidad'],
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

  async findVisiblePlansForProfesionalByUser(
    profesionalId: number,
    userId: number,
  ): Promise<PlanNutricional[]> {
    return this.planNutricionalRepository.find({
      where: {
        paciente: { id: userId },
        visibilidad: { id: profesionalId },
        nutricionista: { id: Not(profesionalId) },
        fechaBaja: IsNull(),
      },
      relations: ['nutricionista'],
    });
  }

  async asignarVisibilidadPlan(
    planId: number,
    profesionalesIds: number[],
    userId: number,
  ): Promise<PlanNutricional> {
    const plan = await this.planNutricionalRepository.findOne({
      where: { id: planId, paciente: { id: userId } },
    });
    if (!plan) {
      throw new Error(`Plan Nutricional con id ${planId} no encontrado`);
    }

    const profesionales = await this.userRepository.findBy({
      id: In(profesionalesIds),
    });

    plan.visibilidad = profesionales;
    return await this.planNutricionalRepository.save(plan);
  }

  async obtenerRutinasPrevias(userId: number): Promise<PlanNutricional[]> {
    if (isNaN(userId)) {
      throw new Error('userId no es un número válido');
    }
    return this.planNutricionalRepository
      .createQueryBuilder('plan')
      .leftJoin('plan.paciente', 'paciente')
      .where('paciente.id = :userId', { userId })
      .andWhere('plan.fechaBaja IS NOT NULL')
      .getMany();
  }
}
