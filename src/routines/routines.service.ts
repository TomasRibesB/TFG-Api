import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { Ejercicio } from 'src/ejercicios/entities/ejercicio.entity';
import { Routine } from './entities/routine.entity';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(Ejercicio)
    private ejercicioRepository: Repository<Ejercicio>,
    @InjectRepository(RutinaEjercicio)
    private ejercicioRegistroRepository: Repository<RutinaEjercicio>,
    @InjectRepository(Routine)
    private routeRepository: Repository<Routine>,
    private userService: UsersService,
  ) {}

  async create(createRoutineDto: CreateRoutineDto, trainerId: number) {
    const userVerify = await this.userService.getUserByProfesional(
      trainerId,
      createRoutineDto.userId,
    );

    if (!userVerify) {
      //no tienes permisos para crear rutinas para este usuario
      throw new UnauthorizedException();
    }

    const routine = new Routine();
    routine.name = createRoutineDto.name;
    routine.description = createRoutineDto.description;
    routine.user = new User();
    routine.user.id = createRoutineDto.userId;
    routine.trainer = new User();
    routine.trainer.id = trainerId;

    return this.routeRepository.save(routine);
  }

  async findByUser(id: number) {
    return this.routeRepository
      .createQueryBuilder('routine')
      .leftJoinAndSelect(
        'routine.rutinaEjercicio',
        'rutinaEjercicio',
        'rutinaEjercicio.fechaBaja IS NULL',
      )
      .leftJoinAndSelect('rutinaEjercicio.ejercicio', 'ejercicio')
      .leftJoinAndSelect('routine.trainer', 'trainer')
      .where('routine.user.id = :id', { id })
      .andWhere('routine.fechaBaja IS NULL')
      .getMany();
  }

  async findForTrainerByUser(trainerId: number, userId: number) {
    return this.routeRepository
      .createQueryBuilder('routine')
      .leftJoinAndSelect(
        'routine.rutinaEjercicio',
        'rutinaEjercicio',
        'rutinaEjercicio.fechaBaja IS NULL',
      )
      .leftJoinAndSelect('rutinaEjercicio.ejercicio', 'ejercicio')
      .where('routine.user.id = :userId', { userId })
      .andWhere('routine.trainer.id = :trainerId', { trainerId })
      .getMany();
  }

  async findById(id: number) {
    return this.routeRepository
      .createQueryBuilder('routine')
      .leftJoinAndSelect('routine.ejercicios', 'ejercicio')
      .leftJoinAndSelect('ejercicio.categoriaEjercicio', 'tipoEjercicio')
      .leftJoinAndSelect('ejercicio.gruposMusculares', 'grupoMuscular')
      .leftJoinAndSelect(
        'ejercicio.ejerciciosRegistros',
        'ejerciciosRegistros',
        'ejerciciosRegistros.routineId = routine.id',
      )
      .where('routine.id = :id', { id })
      .getOne();
  }

  async update(
    updateRoutineDto: UpdateRoutineDto,
    trainerId: number,
  ): Promise<Partial<Routine>> {
    try {
      // 1. Verificar que el entrenador es el dueño de la rutina
      const userVerified = await this.verifyTrainerProprietary(
        trainerId,
        updateRoutineDto.id,
      );
      if (!userVerified) {
        throw new UnauthorizedException();
      }

      // 2. Verificar que cada ejercicio existe (si se envía el array)
      if (updateRoutineDto.ejercicios?.length) {
        const ejerciciosExistentes = await Promise.all(
          updateRoutineDto.ejercicios.map((ej) =>
            this.ejercicioRepository.findOne({ where: { id: ej.id } }),
          ),
        );
        if (ejerciciosExistentes.some((res) => !res)) {
          throw new Error(
            'No se pueden crear ejercicios, solo se pueden agregar los existentes a tu rutina',
          );
        }
      }

      // 3. Cargar la rutina con todas las relaciones (históricos y activos)
      const routine = await this.routeRepository.findOne({
        where: { id: updateRoutineDto.id },
        relations: ['rutinaEjercicio', 'rutinaEjercicio.ejercicio'],
      });
      if (!routine) {
        throw new NotFoundException(
          `Routine with id ${updateRoutineDto.id} not found`,
        );
      }

      // 4. Actualizar las propiedades básicas de la rutina
      routine.name = updateRoutineDto.name;
      routine.description = updateRoutineDto.description;

      // 5. Procesar cada registro enviado en ejerciciosRegistros
      for (const registroDto of updateRoutineDto.ejerciciosRegistros || []) {
        // Validar que el registro incluya la propiedad 'ejercicio' con su 'id'
        if (!registroDto.ejercicio || !registroDto.ejercicio.id) {
          throw new Error(
            'Cada registro de ejercicio debe incluir la propiedad "ejercicio" con su "id".',
          );
        }
        // Buscar registros activos para ese ejercicio
        const activeRecords = routine.rutinaEjercicio.filter(
          (reg) =>
            reg.ejercicio.id === registroDto.ejercicio.id &&
            reg.fechaBaja === null,
        );
        // Marcar como baja todos los registros activos encontrados
        activeRecords.forEach((reg) => (reg.fechaBaja = new Date()));

        // Crear un nuevo registro con los datos actualizados
        const nuevoRegistro = new RutinaEjercicio();
        nuevoRegistro.ejercicio = { id: registroDto.ejercicio.id } as Ejercicio;
        nuevoRegistro.routine = routine;
        nuevoRegistro.series = registroDto.series;
        nuevoRegistro.repeticiones = registroDto.repeticiones;
        nuevoRegistro.medicion = registroDto.medicion;
        nuevoRegistro.fecha = new Date(registroDto.fecha);

        // Agregar el nuevo registro a la colección (sin reemplazar los históricos)
        routine.rutinaEjercicio.push(nuevoRegistro);
      }

      // 6. Si existen registros activos que NO están en el DTO, darlos de baja
      const dtoEjercicioIds = new Set(
        (updateRoutineDto.ejerciciosRegistros || []).map((r) => r.ejercicio.id),
      );
      routine.rutinaEjercicio.forEach((reg) => {
        if (reg.fechaBaja === null && !dtoEjercicioIds.has(reg.ejercicio.id)) {
          reg.fechaBaja = new Date();
        }
      });

      // 7. Guardar la rutina (con cascade se persisten los nuevos registros)
      await this.routeRepository.save(routine);

      // 8. Recargar la rutina incluyendo solo los registros activos para la respuesta
      const routineUpdated = await this.routeRepository
        .createQueryBuilder('routine')
        .leftJoinAndSelect(
          'routine.rutinaEjercicio',
          'rutinaEjercicio',
          'rutinaEjercicio.fechaBaja IS NULL',
        )
        .leftJoinAndSelect('rutinaEjercicio.ejercicio', 'ejercicio')
        .where('routine.id = :id', { id: updateRoutineDto.id })
        .andWhere('routine.trainerId = :trainerId', { trainerId })
        .getOne();

      return routineUpdated;
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  async remove(id: number, trainerId: number) {
    //le pongo fecha de baja a la rutina
    const routine = await this.routeRepository.findOne({
      where: { id, trainer: { id: trainerId } },
    });
    if (!routine) {
      throw new Error(`Rutina con id ${id} no encontrada`);
    }
    routine.fechaBaja = new Date();

    return this.routeRepository.save(routine);
  }

  async removeExercise(routineId: number, exerciseId: number) {
    //1. verifico que no tenga registros, si los tiene los borro
    //2. borro la relacion
    //3. ni el ejercicio ni la rutina se borran, solo la relacion
    const routine = await this.routeRepository.findOne({
      where: { id: routineId },
      relations: ['ejercicios'],
    });
    const exercise = await this.ejercicioRepository.findOne({
      where: { id: exerciseId },
    });
    if (!routine || !exercise) {
      throw new Error('No se encontró la rutina o el ejercicio');
    }
    //1
    const exerciseRegistros = await this.ejercicioRegistroRepository.find({
      where: { ejercicio: { id: exerciseId } },
    });
    if (exerciseRegistros && exerciseRegistros.length > 0) {
      await this.ejercicioRegistroRepository.remove(exerciseRegistros);
    }
    //2
    routine.rutinaEjercicio = routine.rutinaEjercicio.filter(
      (re) => re.ejercicio.id !== exerciseId,
    );
    return this.routeRepository.save(routine);
  }

  async verifyTrainerProprietary(trainerId: number, routineId: number) {
    return this.routeRepository.findOne({
      where: { id: routineId, trainer: { id: trainerId } },
    });
  }
}
