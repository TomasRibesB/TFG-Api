import { Module } from '@nestjs/common';
import { CategoriaEjerciciosService } from './categoria-ejercicios.service';
import { CategoriaEjerciciosController } from './categoria-ejercicios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ejercicio } from '../ejercicios/entities/ejercicio.entity';
import { CategoriaEjercicio } from './entities/categoria-ejercicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ejercicio, CategoriaEjercicio])],
  controllers: [CategoriaEjerciciosController],
  providers: [CategoriaEjerciciosService],
})
export class CategoriaEjerciciosModule {}
