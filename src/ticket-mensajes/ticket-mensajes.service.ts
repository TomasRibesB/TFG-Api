import { Injectable } from '@nestjs/common';
import { CreateTicketMensajeDto } from './dto/create-ticket-mensaje.dto';
import { UpdateTicketMensajeDto } from './dto/update-ticket-mensaje.dto';

@Injectable()
export class TicketMensajesService {
  create(createTicketMensajeDto: CreateTicketMensajeDto) {
    return 'This action adds a new ticketMensaje';
  }

  findAll() {
    return `This action returns all ticketMensajes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ticketMensaje`;
  }

  update(id: number, updateTicketMensajeDto: UpdateTicketMensajeDto) {
    return `This action updates a #${id} ticketMensaje`;
  }

  remove(id: number) {
    return `This action removes a #${id} ticketMensaje`;
  }
}
