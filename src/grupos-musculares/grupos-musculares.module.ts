import { Module } from '@nestjs/common';
import { GruposMuscularesService } from './grupos-musculares.service';
import { GruposMuscularesController } from './grupos-musculares.controller';
import { Ejercicio } from 'src/ejercicios/entities/ejercicio.entity';
import { GruposMusculares } from 'src/grupos-musculares/entities/grupos-musculare.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Ejercicio, GruposMusculares])],
  controllers: [GruposMuscularesController],
  providers: [GruposMuscularesService],
  exports: [GruposMuscularesService],
})
export class GruposMuscularesModule {}
