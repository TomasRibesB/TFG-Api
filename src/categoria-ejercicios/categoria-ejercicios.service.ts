import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'
import { CategoriaEjercicio } from './entities/categoria-ejercicio.entity';

@Injectable()
export class CategoriaEjerciciosService {
  /*create(createCategoriaEjercicioDto: CreateCategoriaEjercicioDto) {
    return 'This action adds a new categoriaEjercicio';
  }*/

  constructor(
    @InjectRepository(CategoriaEjercicio)
    private categoriaEjercicioRepository: Repository<CategoriaEjercicio>,
  ) {}

  async findAll() {
    return this.categoriaEjercicioRepository.find();
  }

  findOne(id: number) {
    return this.categoriaEjercicioRepository.findOne({ where: { id } });
  }

  /*update(id: number, updateCategoriaEjercicioDto: UpdateCategoriaEjercicioDto) {
    return `This action updates a #${id} categoriaEjercicio`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoriaEjercicio`;
  }*/
}
