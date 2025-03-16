import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { Turno } from './entities/turno.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TurnosService {
  constructor(
    @InjectRepository(Turno)
    private turnoRepository: Repository<Turno>,
  ) {}
  async findByUser(id: number) {
    return this.turnoRepository.find({
      where: [
        {
          paciente: { id },
        },
        {
          profesional: { id },
        },
      ],
      relations: ['profesional', 'paciente'],
      order: { fechaHora: 'ASC' },
    });
  }

  async create(createTurnoDto: CreateTurnoDto, profesionalId: number) {
    // Verificar que no exista un turno con la misma fecha y hora para este profesional
    const turnos = await this.turnoRepository.find({
      where: {
        fechaHora: new Date(createTurnoDto.fechaHora),
        profesional: { id: profesionalId },
      },
    });
    console.log(turnos);
    if (turnos.length > 0) {
      throw new UnauthorizedException(
        'Ya existe un turno en la misma fecha y hora',
      );
    }

    //verifico ue el turno no sea anterior a la fecha actual
    if (new Date(createTurnoDto.fechaHora) < new Date()) {
      throw new UnauthorizedException(
        'La fecha del turno es anterior a la actual',
      );
    }

    // Construir el objeto newTurno sin esparcir el DTO directamente
    const newTurno: Partial<Turno> = {
      fechaHora: createTurnoDto.fechaHora,
      profesional: { id: profesionalId } as any,
      paciente: createTurnoDto.pacienteId
        ? ({ id: createTurnoDto.pacienteId } as any)
        : null,
    };

    return this.turnoRepository.save(newTurno);
  }

  async update(
    id: number,
    updateTurnoDto: UpdateTurnoDto,
    profesionalId: number,
  ) {
    //verifico que el turno esté asignado al profesional
    const turno = await this.turnoRepository.findOne({
      where: { id, profesional: { id: profesionalId } },
      relations: ['profesional', 'paciente'],
    });
    if (!turno) {
      throw new UnauthorizedException(
        'No tiene permisos para modificar el turno',
      );
    }

    if (updateTurnoDto.fechaHora) {
      // Verificar que no exista un turno con la misma fecha y hora para este profesional
      const turnos = await this.turnoRepository.find({
        where: {
          fechaHora: new Date(updateTurnoDto.fechaHora),
          profesional: { id: profesionalId },
        },
      });
      if (turnos.length > 0) {
        throw new UnauthorizedException(
          'Ya existe un turno en la misma fecha y hora',
        );
      }
    }

    //verifico ue el turno no sea anterior a la fecha actual
    if (
      updateTurnoDto.fechaHora &&
      new Date(updateTurnoDto.fechaHora) < new Date()
    ) {
      throw new UnauthorizedException(
        'La fecha del turno es anterior a la actual',
      );
    }

    const updatedTurno = this.turnoRepository.merge(turno, updateTurnoDto);
    if (updateTurnoDto.pacienteId !== undefined) {
      updatedTurno.paciente = updateTurnoDto.pacienteId
        ? ({ id: updateTurnoDto.pacienteId } as any)
        : null;
    }

    return this.turnoRepository.save(updatedTurno);
  }

  async asignarTurnoForPaciente(id: number, pacienteId: number) {
    return this.turnoRepository.update(id, { paciente: { id: pacienteId } });
  }

  async remove(id: number, profesionalId: number) {
    return await this.turnoRepository.delete({
      id,
      paciente: IsNull(),
      profesional: { id: profesionalId },
    });
  }
}
