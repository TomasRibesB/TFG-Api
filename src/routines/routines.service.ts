import { Injectable } from '@nestjs/common';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { Ejercicio } from "src/ejercicios/entities/ejercicio.entity";
import { Routine } from './entities/routine.entity';
import { RutinaEjercicio } from "src/rutina-ejercicio/entities/rutina-ejercicio.entity";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RoutinesService {

  constructor(
    @InjectRepository(Ejercicio)
    private ejercicioRepository: Repository<Ejercicio>,
    @InjectRepository(RutinaEjercicio)
    private ejercicioRegistroRepository: Repository<RutinaEjercicio>,
    @InjectRepository(Routine)
    private routeRepository: Repository<Routine>,
  ) { }

  async create(createRoutineDto: CreateRoutineDto) {
    return this.routeRepository.save(createRoutineDto);
  }

  async findByPlan(id: number) {
    return this.routeRepository.find({ where: { plan: { id } }, relations: ['ejercicios', 'ejerciciosRegistros', 'ejercicios.categoriaEjercicio', 'ejercicios.gruposMusculares'] });
  }

  async findById(id: number) {
    return this.routeRepository.createQueryBuilder('routine')
      .leftJoinAndSelect('routine.ejercicios', 'ejercicio')
      .leftJoinAndSelect('ejercicio.categoriaEjercicio', 'tipoEjercicio')
      .leftJoinAndSelect('ejercicio.gruposMusculares', 'grupoMuscular')
      .leftJoinAndSelect('ejercicio.ejerciciosRegistros', 'ejerciciosRegistros', 'ejerciciosRegistros.routineId = routine.id')
      .where('routine.id = :id', { id })
      .getOne();
  }

  async update(updateRoutineDto: UpdateRoutineDto) {
    //si tiene ejercicios el dto verifico si existen
    if (updateRoutineDto.ejercicios && Array.isArray(updateRoutineDto.ejercicios) && updateRoutineDto.ejercicios.length > 0) {
      for (const ejercicio of updateRoutineDto.ejercicios) {
        const ejercicioExist = await this.ejercicioRepository.findOne({ where: { id: ejercicio.id } });
        if (!ejercicioExist) {
          throw new Error('No se pueden crear ejercicios, solo se pueden agregar los existentes a tu rutina');
        }
      }
    }
    //si tiene ejercicios registros el dto los creo
    if (updateRoutineDto.ejerciciosRegistros && updateRoutineDto.ejerciciosRegistros.length > 0) {
      for (const ejercicioRegistro of updateRoutineDto.ejerciciosRegistros) {
        await this.ejercicioRegistroRepository.save(ejercicioRegistro);
      }
    }
    console.log("updateRoutineDto", updateRoutineDto);

    // Primero obtenemos la rutina que queremos actualizar
    const routine = await this.routeRepository.findOne({ where: { id: updateRoutineDto.id } });

    // Luego actualizamos las propiedades que queremos cambiar
    routine.name = updateRoutineDto.name;
    routine.description = updateRoutineDto.description;

    // Para actualizar la relación de muchos a muchos, primero debemos obtener las entidades relacionadas
    routine.ejercicios = [];
    if (updateRoutineDto.ejercicios && Array.isArray(updateRoutineDto.ejercicios) && updateRoutineDto.ejercicios.length > 0) {
      for (const ejercicio of updateRoutineDto.ejercicios) {
        const ejercicioEntity = await this.ejercicioRepository.findOne({ where: { id: ejercicio.id } });
        routine.ejercicios.push(ejercicioEntity);
      }
    }

    // Finalmente guardamos la entidad actualizada
    return this.routeRepository.save(routine);
  }

  async remove(id: number) {
    return this.routeRepository.delete(id);
  }

  async removeExercise(routineId: number, exerciseId: number) {
    //1. verifico que no tenga registros, si los tiene los borro
    //2. borro la relacion
    //3. ni el ejercicio ni la rutina se borran, solo la relacion
    const routine = await this.routeRepository.findOne({ where: { id: routineId }, relations: ['ejercicios'] });
    const exercise = await this.ejercicioRepository.findOne({ where: { id: exerciseId } });
    if (!routine || !exercise) {
      throw new Error('No se encontró la rutina o el ejercicio');
    }
    //1
    const exerciseRegistros = await this.ejercicioRegistroRepository.find({ where: { ejercicio: { id: exerciseId } } });
    if (exerciseRegistros && exerciseRegistros.length > 0) {
      await this.ejercicioRegistroRepository.remove(exerciseRegistros);
    }
    //2
    routine.ejercicios = routine.ejercicios.filter(e => e.id !== exerciseId);
    return this.routeRepository.save(routine);
  }
}
