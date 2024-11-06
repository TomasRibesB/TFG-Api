import { Module } from '@nestjs/common';
import { EjerciciosService } from './ejercicios.service';
import { EjerciciosController } from './ejercicios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ejercicio } from './entities/ejercicio.entity';
import { GruposMusculares } from 'src/grupos-musculares/entities/grupos-musculare.entity';
import { CategoriaEjercicio } from 'src/categorias-ejercicios/entities/categoria-ejercicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ejercicio, GruposMusculares, CategoriaEjercicio])],
  controllers: [EjerciciosController],
  providers: [EjerciciosService],
})
export class EjerciciosModule {}
