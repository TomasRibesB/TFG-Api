import { Module } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { TurnosEmailNotificationService } from './turnos.email.notification.service';
import { TurnosController } from './turnos.controller';
import { Turno } from './entities/turno.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/email/email.module';

@Module({
  controllers: [TurnosController],
  imports: [TypeOrmModule.forFeature([Turno]), EmailModule],
  providers: [TurnosService, TurnosEmailNotificationService],
})
export class TurnosModule {}
