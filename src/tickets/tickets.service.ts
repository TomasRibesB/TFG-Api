import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  findTicketsByUser(id: number) {
    return this.ticketRepository.find({
      where: { usuario: { id } },
      relations: ['receptor', 'solicitante', 'mensajes'],
    });
  }
}
