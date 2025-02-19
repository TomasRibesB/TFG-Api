import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
      relations: ['receptor', 'solicitante', 'usuario'],
    });
  }

  async findTicketById(id: number, userId: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['receptor', 'solicitante', 'usuario', 'mensajes'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con id=${id} no encontrado`);
    }

    if (
      ticket.solicitante.id !== userId &&
      ticket.receptor.id !== userId &&
      ticket.usuario.id !== userId
    ) {
      throw new UnauthorizedException('Usuario no tiene acceso a este ticket');
    }

    return ticket;
  }
}
