import { Module } from '@nestjs/common';
import { TipoProfesionalService } from './tipo-profesional.service';
import { TipoProfesionalController } from './tipo-profesional.controller';

@Module({
  controllers: [TipoProfesionalController],
  providers: [TipoProfesionalService],
})
export class TipoProfesionalModule {}
