import { Injectable } from '@nestjs/common';
import { Ejercicio } from './entities/ejercicio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EjerciciosService {
  /*create(createEjercicioDto: CreateEjercicioDto) {
    return 'This action adds a new ejercicio';
  }*/

  constructor(
    @InjectRepository(Ejercicio)
    private ejercicioRepository: Repository<Ejercicio>,
  ) {}

  async findAll(search?: string, categoria?: string, grupoMuscular?: string) {
    const qb = this.ejercicioRepository
      .createQueryBuilder('ejercicio')
      .leftJoinAndSelect('ejercicio.categoriaEjercicio', 'categoriaEjercicio')
      .leftJoinAndSelect('ejercicio.gruposMusculares', 'gruposMusculares')
      .take(30);

    if (search) {
      console.log('search', search);
      qb.andWhere('ejercicio.name like :search', { search: `%${search}%` });
    }
    if (categoria) {
      qb.andWhere('ejercicio.categoriaEjercicio IN (:...categoria)', {
        categoria: categoria.split(','),
      });
    }
    if (grupoMuscular) {
      qb.andWhere('ejercicio.gruposMusculares IN (:...grupoMuscular)', {
        grupoMuscular: grupoMuscular.split(','),
      });
    }

    return qb.getMany();
  }

  async findOne(id: number) {
    return this.ejercicioRepository.findOne({
      where: { id },
      relations: ['categoriaEjercicio', 'gruposMusculares'],
    });
  }

  /*update(id: number, updateEjercicioDto: UpdateEjercicioDto) {
    return `This action updates a #${id} ejercicio`;
  }

  remove(id: number) {
    return `This action removes a #${id} ejercicio`;
  }
  */
}
