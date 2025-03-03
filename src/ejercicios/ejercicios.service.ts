import { Injectable } from '@nestjs/common';
import { Ejercicio } from './entities/ejercicio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaEjerciciosService } from 'src/categoria-ejercicios/categoria-ejercicios.service';
import { GruposMuscularesService } from 'src/grupos-musculares/grupos-musculares.service';

@Injectable()
export class EjerciciosService {
  /*create(createEjercicioDto: CreateEjercicioDto) {
    return 'This action adds a new ejercicio';
  }*/

  constructor(
    @InjectRepository(Ejercicio)
    private ejercicioRepository: Repository<Ejercicio>,
    private readonly categoriaEjerciciosService: CategoriaEjerciciosService,
    private readonly gruposMuscularesService: GruposMuscularesService,
  ) {}

  async findAll(search?: string, categoria?: string, grupoMuscular?: string) {
    console.log(
      'search',
      search,
      'categoria',
      categoria,
      'grupoMuscular',
      grupoMuscular,
    );
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
      qb.andWhere('categoriaEjercicio.id IN (:...categoria)', {
        categoria: categoria.split(','),
      });
    }
    if (grupoMuscular) {
      qb.andWhere('gruposMusculares.id IN (:...grupoMuscular)', {
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

  async findCategoriasAndGruposMusculares() {
    const gruposMusculares = await this.gruposMuscularesService.findAll();
    const categorias = await this.categoriaEjerciciosService.findAll();
    return { gruposMusculares, categorias };
  }
}
