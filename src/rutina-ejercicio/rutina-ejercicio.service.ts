import { Injectable } from '@nestjs/common';
import { CreateRutinaEjercicioDto } from './dto/create-rutina-ejercicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RutinaEjercicio } from './entities/rutina-ejercicio.entity';
import { Ejercicio } from 'src/ejercicios/entities/ejercicio.entity';
import { Routine } from 'src/routines/entities/routine.entity';
import { Registro } from './entities/registro.entity';
import { GruposMuscularesService } from 'src/grupos-musculares/grupos-musculares.service';

@Injectable()
export class RutinaEjercicioService {
  constructor(
    @InjectRepository(RutinaEjercicio)
    private ejercicioRegistroRepository: Repository<RutinaEjercicio>,
    @InjectRepository(Ejercicio)
    private ejercicioRepository: Repository<Ejercicio>,
    @InjectRepository(Routine)
    private routineRepository: Repository<Routine>,
    @InjectRepository(Registro)
    private registroRepository: Repository<Registro>,
    private gruposMuscularesService: GruposMuscularesService,
  ) {}

  async create(createRutinaEjercicioDto: CreateRutinaEjercicioDto) {
    return this.ejercicioRegistroRepository.save(createRutinaEjercicioDto);
  }

  async createRegistros(RuExIds: number[]) {
    //creo un registro por cada rutina-ejercicio
    const registros = RuExIds.map((RuExId) => {
      return this.registroRepository.save({ rutinaEjercicio: { id: RuExId } });
    });

    return Promise.all(registros);
  }

  async findAllByUser(id: number) {
    const registro = await this.ejercicioRegistroRepository
      .createQueryBuilder('rutinaEjercicio')
      .leftJoinAndSelect('rutinaEjercicio.ejercicio', 'ejercicio')
      .leftJoinAndSelect('ejercicio.categoriaEjercicio', 'categoriaEjercicio')
      .leftJoinAndSelect('ejercicio.gruposMusculares', 'gruposMusculares')
      .leftJoinAndSelect('rutinaEjercicio.routine', 'routine')
      .leftJoin('routine.user', 'user')
      .leftJoinAndSelect('rutinaEjercicio.registros', 'registros')
      .where('user.id = :id', { id })
      .getMany();

      const gruposMusculares = await this.gruposMuscularesService.findAll();
      return { registro, gruposMusculares };
  }

  async findOne(id: number) {
    return this.ejercicioRegistroRepository.findOne({
      where: { id, fechaBaja: null },
    });
  }

  async findLastRutinaEjercicio(id: number) {
    return this.ejercicioRegistroRepository.findOne({
      where: { id, fechaBaja: null },
      order: { fecha: 'DESC' },
      relations: ['routine', 'ejercicio'],
    });
  }

  async findRutinaEjercicio(rid: number, eid: number) {
    console.log(rid, eid);
    return this.ejercicioRegistroRepository.find({
      where: { routine: { id: rid }, ejercicio: { id: eid }, fechaBaja: null },
      relations: ['routine', 'ejercicio'],
      order: { id: 'DESC' },
    });
  }

  /*update(id: number, updateRutinaEjercicioDto: UpdateRutinaEjercicioDto) {
    return `This action updates a #${id} ejercicioRegistro`;
  }
  */

  async remove(id: number) {
    return this.ejercicioRegistroRepository.delete(id);
  }
}
