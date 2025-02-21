import { Injectable } from '@nestjs/common';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { Turno } from './entities/turno.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TurnosService {
  constructor(
    @InjectRepository(Turno)
    private turnoRepository: Repository<Turno>,
  ) {}
  findByUser(id: number) {
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
    });
  }
}
