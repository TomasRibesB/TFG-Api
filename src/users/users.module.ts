import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { TipoProfesional } from 'src/tipo-profesional/entities/tipo-profesional.entity';
import { UserTipoProfesional } from 'src/tipo-profesional/entities/user-tipo-profesional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, TipoProfesional, UserTipoProfesional])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
