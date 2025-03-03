import { Module } from '@nestjs/common';
import { EjerciciosService } from './ejercicios.service';
import { EjerciciosController } from './ejercicios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ejercicio } from './entities/ejercicio.entity';
import { GruposMusculares } from 'src/grupos-musculares/entities/grupos-musculare.entity';
import { CategoriaEjercicio } from 'src/categoria-ejercicios/entities/categoria-ejercicio.entity';
import { GruposMuscularesModule } from 'src/grupos-musculares/grupos-musculares.module';
import { CategoriaEjerciciosModule } from 'src/categoria-ejercicios/categoria-ejercicios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ejercicio, GruposMusculares, CategoriaEjercicio]),
    GruposMuscularesModule,
    CategoriaEjerciciosModule,
  ],
  controllers: [EjerciciosController],
  providers: [EjerciciosService],
})
export class EjerciciosModule {}
