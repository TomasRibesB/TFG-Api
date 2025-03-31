import { Module } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from './entities/documento.entity';
import { TipoProfesional } from 'src/tipo-profesional/entities/tipo-profesional.entity';
import { PermisoDocumento } from './entities/permisoDocumento.entity';
import { User } from 'src/users/entities/user.entity';
import { DocumentosEmailNotificationService } from './documentos.email.notification.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  controllers: [DocumentosController],
  providers: [DocumentosService, DocumentosEmailNotificationService],
  imports: [
    TypeOrmModule.forFeature([
      Documento,
      TipoProfesional,
      PermisoDocumento,
      User,
    ]),
    EmailModule,
  ],
})
export class DocumentosModule {}
