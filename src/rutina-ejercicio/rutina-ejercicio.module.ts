import { Module } from '@nestjs/common';
import { RutinaEjercicioService } from './rutina-ejercicio.service';
import { RutinaEjercicioController } from './rutina-ejercicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RutinaEjercicio } from './entities/rutina-ejercicio.entity';
import { Ejercicio } from 'src/ejercicios/entities/ejercicio.entity';
import { Routine } from 'src/routines/entities/routine.entity';
import { Registro } from './entities/registro.entity';
import { GruposMuscularesService } from 'src/grupos-musculares/grupos-musculares.service';
import {GruposMusculares} from 'src/grupos-musculares/entities/grupos-musculare.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RutinaEjercicio, Ejercicio, Routine, Registro, GruposMusculares])],
  controllers: [RutinaEjercicioController],
  providers: [RutinaEjercicioService, GruposMuscularesService],
})
export class RutinaEjercicioModule {}
