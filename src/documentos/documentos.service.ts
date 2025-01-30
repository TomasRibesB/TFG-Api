import { Injectable } from '@nestjs/common';
import { CreateDocumentoDto } from './dto/create-documento.dto';
//import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private documentoRepository: Repository<Documento>,
  ) {}

  create(createDocumentoDto: CreateDocumentoDto) {
    return this.documentoRepository.save(createDocumentoDto);
  }

  findByUser(id: number) {
    return this.documentoRepository.find({
      where: {
        usuario: { id },
      },
      relations: ['profesional'],
    });
  }
}
