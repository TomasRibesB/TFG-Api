import { Injectable } from '@nestjs/common';
import { CreateTipoProfesionalDto } from './dto/create-tipo-profesional.dto';
import { UpdateTipoProfesionalDto } from './dto/update-tipo-profesional.dto';

@Injectable()
export class TipoProfesionalService {
  create(createTipoProfesionalDto: CreateTipoProfesionalDto) {
    return 'This action adds a new tipoProfesional';
  }

  findAll() {
    return `This action returns all tipoProfesional`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tipoProfesional`;
  }

  update(id: number, updateTipoProfesionalDto: UpdateTipoProfesionalDto) {
    return `This action updates a #${id} tipoProfesional`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipoProfesional`;
  }
}
