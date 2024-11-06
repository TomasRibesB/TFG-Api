import { Injectable } from '@nestjs/common';
import { CreateRutinaEjercicioDto } from './dto/create-rutina-ejercicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'
import { RutinaEjercicio } from './entities/rutina-ejercicio.entity';
import { Ejercicio } from 'src/ejercicios/entities/ejercicio.entity';
import { Routine } from 'src/routines/entities/routine.entity';

@Injectable()
export class RutinaEjercicioService {
  constructor(
    @InjectRepository(RutinaEjercicio)
    private ejercicioRegistroRepository: Repository<RutinaEjercicio>,
    @InjectRepository(Ejercicio)
    private ejercicioRepository: Repository<Ejercicio>,
    @InjectRepository(Routine)
    private routineRepository: Repository<Routine>

  ) { }


  async create(createRutinaEjercicioDto: CreateRutinaEjercicioDto) {
    return this.ejercicioRegistroRepository.save(createRutinaEjercicioDto);
  }

  async findAll() {
    return this.ejercicioRegistroRepository.find();
  }

  async findOne(id: number) {
    return this.ejercicioRegistroRepository.findOne({ where: { id } });
  }

  async findLastRutinaEjercicio(id: number) {
    return this.ejercicioRegistroRepository.findOne({ where: { id }, order: { fecha: "DESC" }, relations: ["routine", "ejercicio"] });
  }

  async findRutinaEjercicio(rid: number, eid: number) {
    console.log(rid, eid);
    return this.ejercicioRegistroRepository.find({ where: { routine: {id: rid}, ejercicio: {id: eid} }, relations: ["routine", "ejercicio"], order: { id: "DESC" } });
  }

  /*update(id: number, updateRutinaEjercicioDto: UpdateRutinaEjercicioDto) {
    return `This action updates a #${id} ejercicioRegistro`;
  }
  */

  async remove(id: number) {
    return this.ejercicioRegistroRepository.delete(id);
  }
}
