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

  findDocumentsFoyProfesionalByUser(profesionalId: number, userId: number) {
    console.log(profesionalId, userId);
    return this.documentoRepository.find({
      where: {
        usuario: { id: userId },
        profesional: { id: profesionalId },
      },
      relations: ['usuario'],
    });
  }

  findVisibleDocumentsForProfesionalByUser(profesionalId: number, userId: number) {
    return this.documentoRepository.find({
      where: {
        usuario: { id: userId },
        visibilidad: { id: profesionalId },
      },
      relations: ['usuario'],
    });
  }
}
