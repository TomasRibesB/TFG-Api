import { Module } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { Turno } from './entities/turno.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [TurnosController],
  providers: [TurnosService],
  imports: [TypeOrmModule.forFeature([Turno])],
})
export class TurnosModule {}
