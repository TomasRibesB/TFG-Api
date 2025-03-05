// src/documentos/documentos.service.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { TipoProfesional } from 'src/tipo-profesional/entities/tipo-profesional.entity';
import * as sharp from 'sharp';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private documentoRepository: Repository<Documento>,
    @InjectRepository(TipoProfesional)
    private tipoProfesionalRepository: Repository<TipoProfesional>,
  ) {}

  async create(
    createDocumentoDto: CreateDocumentoDto,
  ): Promise<Documento> {
    const documento : Partial<Documento> = this.documentoRepository.create(createDocumentoDto);
    if (createDocumentoDto.tipoProfesionalId) {
      const tipoProfesional = await this.tipoProfesionalRepository.findOne({
        where: { id: createDocumentoDto.tipoProfesionalId },
      });
      if (!tipoProfesional) {
        throw new Error(
          `TipoProfesional con id ${createDocumentoDto.tipoProfesionalId} no encontrado`,
        );
      }
      documento.tipoProfesional = tipoProfesional;
    }
    documento.usuario = { id: createDocumentoDto.usuarioId } as any;
    documento.profesional = { id: createDocumentoDto.profesionalId } as any;
    return await this.documentoRepository.save(documento);
  }

  async update(updateDocumentoDto: UpdateDocumentoDto): Promise<Documento> {
    const documento = await this.documentoRepository.findOne({
      where: { id: updateDocumentoDto.id },
    });
    if (!documento) {
      throw new Error(
        `Documento con id ${updateDocumentoDto.id} no encontrado`,
      );
    }
    this.documentoRepository.merge(documento, updateDocumentoDto);
    if (updateDocumentoDto.tipoProfesionalId != null) {
      const tipoProfesional = await this.tipoProfesionalRepository.findOne({
        where: { id: updateDocumentoDto.tipoProfesionalId },
      });
      if (!tipoProfesional) {
        throw new Error(
          `TipoProfesional con id ${updateDocumentoDto.tipoProfesionalId} no encontrado`,
        );
      }
      documento.tipoProfesional = tipoProfesional;
    }

    documento.usuario = { id: updateDocumentoDto.usuarioId } as any;
    documento.profesional = { id: updateDocumentoDto.profesionalId } as any;

    return await this.documentoRepository.save(documento);
  }

  async uploadDocumentoArchivo(id: number, archivoBuffer: Buffer) {
    const documento = await this.documentoRepository.findOne({
      where: { id },
    });
    if (!documento) {
      throw new Error(`Documento con id ${id} no encontrado`);
    }
    documento.archivo = await sharp(archivoBuffer)
      .jpeg({ quality: 80 })
      .toBuffer();
    return await this.documentoRepository.save(documento);
  }

  findByUser(id: number) {
    return this.documentoRepository.find({
      where: { usuario: { id } },
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

  findVisibleDocumentsForProfesionalByUser(
    profesionalId: number,
    userId: number,
  ) {
    return this.documentoRepository.find({
      where: {
        usuario: { id: userId },
        visibilidad: { id: profesionalId },
      },
      relations: ['usuario'],
    });
  }

  async findOneWithArchivo(id: number): Promise<Documento> {
    const documento = await this.documentoRepository
      .createQueryBuilder('documento')
      .addSelect('documento.archivo')
      .where('documento.id = :id', { id })
      .getOne();

    if (!documento) {
      throw new Error(`Documento con id ${id} no encontrado`);
    }
    return documento;
  }
}
