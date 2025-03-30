import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketsEmailNotificationService } from './tickets.email.notification.service';
import { Ticket } from './entities/ticket.entity';
import { ChatModule } from './chat/chat.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    ChatModule,
    EmailModule, // se importa el módulo que exporta EmailService
  ],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsEmailNotificationService],
})
export class TicketsModule {}
