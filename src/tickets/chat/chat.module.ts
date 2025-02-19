// chat.module.ts
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { TicketMensaje } from 'src/ticket-mensajes/entities/ticket-mensaje.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketMensaje])],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
