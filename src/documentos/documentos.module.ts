import { Module } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from './entities/documento.entity';
import { TipoProfesional } from 'src/tipo-profesional/entities/tipo-profesional.entity';
import { PermisoDocumento } from './entities/permisoDocumento.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  controllers: [DocumentosController],
  providers: [DocumentosService],
  imports: [TypeOrmModule.forFeature([Documento, TipoProfesional, PermisoDocumento, User])],
})
export class DocumentosModule {}
