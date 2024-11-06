import { Module } from '@nestjs/common';
import { RutinaEjercicioService } from './rutina-ejercicio.service';
import { RutinaEjercicioController } from './rutina-ejercicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RutinaEjercicio } from './entities/rutina-ejercicio.entity';
import { Ejercicio } from 'src/ejercicios/entities/ejercicio.entity';
import { Routine } from 'src/routines/entities/routine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RutinaEjercicio, Ejercicio, Routine])],
  controllers: [RutinaEjercicioController],
  providers: [RutinaEjercicioService],
})
export class RutinaEjercicioModule {}
