// src/documentos/dto/update-documento.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentoDto } from './create-documento.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateDocumentoDto extends PartialType(CreateDocumentoDto) {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}