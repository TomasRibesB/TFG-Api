import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { Routine } from './entities/routine.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ejercicio } from 'src/ejercicios/entities/ejercicio.entity';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Routine, Ejercicio, RutinaEjercicio, User]),
    UsersModule,
  ],
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}
