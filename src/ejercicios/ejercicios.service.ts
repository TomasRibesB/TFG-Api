import { Injectable } from '@nestjs/common';
import { Ejercicio } from './entities/ejercicio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'

@Injectable()
export class EjerciciosService {
  /*create(createEjercicioDto: CreateEjercicioDto) {
    return 'This action adds a new ejercicio';
  }*/

  constructor(
    @InjectRepository(Ejercicio)
    private ejercicioRepository: Repository<Ejercicio>,
  ) {}

  async findAll() {
    return this.ejercicioRepository.find({ relations: ['categoriaEjercicio', 'gruposMusculares'] });
  }

  async findOne(id: number) {
    return this.ejercicioRepository.findOne({ where: { id }, relations: ['categoriaEjercicio', 'gruposMusculares'] });
  }

  /*update(id: number, updateEjercicioDto: UpdateEjercicioDto) {
    return `This action updates a #${id} ejercicio`;
  }

  remove(id: number) {
    return `This action removes a #${id} ejercicio`;
  }
  */
}
