import { Injectable } from '@nestjs/common';
import { CreateGruposMusculareDto } from './dto/create-grupos-musculare.dto';
import { UpdateGruposMusculareDto } from './dto/update-grupos-musculare.dto';
import { GruposMusculares } from './entities/grupos-musculare.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GruposMuscularesService {
  /*create(createGruposMusculareDto: CreateGruposMusculareDto) {
    return 'This action adds a new GruposMusculares';
  }*/

  constructor(
    @InjectRepository(GruposMusculares)
    private gruposMuscularesRepository: Repository<GruposMusculares>,
  ) {}

  async findAll() {
    return this.gruposMuscularesRepository.find();
  }

  async findOne(id: number) {
    return this.gruposMuscularesRepository.findOne({ where: { id } });
  }

  /*update(id: number, updateGruposMusculareDto: UpdateGruposMusculareDto) {
    return `This action updates a #${id} GruposMusculares`;
  }

  remove(id: number) {
    return `This action removes a #${id} GruposMusculares`;
  }*/
}
