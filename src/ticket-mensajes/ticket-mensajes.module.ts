import { Module } from '@nestjs/common';
import { TicketMensajesService } from './ticket-mensajes.service';
import { TicketMensajesController } from './ticket-mensajes.controller';

@Module({
  controllers: [TicketMensajesController],
  providers: [TicketMensajesService],
})
export class TicketMensajesModule {}
