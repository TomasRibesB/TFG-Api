// src/documentos/dto/create-documento.dto.ts
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { TipoDocumento } from '../entities/tipoDocumentos.enum';

export class CreateDocumentoDto {
  @IsNotEmpty()
  @IsEnum(TipoDocumento)
  tipo: TipoDocumento;

  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;
  
  // Datos opcionales del profesional que sube el documento
  @IsOptional()
  @IsString()
  nombreProfesional?: string;

  @IsOptional()
  @IsString()
  apellidoProfesional?: string;

  @IsOptional()
  @IsString()
  emailProfesional?: string;

  @IsOptional()
  @IsString()
  dniProfesional?: string;

  // Id del profesional (si está registrado)
  @IsOptional()
  @IsNumber()
  profesionalId?: number;

  // Id del usuario propietario del documento
  @IsNotEmpty()
  @IsNumber()
  usuarioId: number;

  @IsOptional()
  @IsNumber()
  tipoProfesionalId?: number;
}