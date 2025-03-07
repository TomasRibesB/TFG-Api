import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { EstadoConsentimiento } from './entities/estadoConsentimiento.enum';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  async findTicketsByUser(id: number) {
    const tickets = await this.ticketRepository.find({
      where: [
        {
          consentimientoUsuario: In([
            EstadoConsentimiento.Aceptado,
            EstadoConsentimiento.Pendiente,
          ]),
          usuario: { id },
          fechaBaja: null,
        },
        {
          consentimientoUsuario: In([
            EstadoConsentimiento.Aceptado,
            EstadoConsentimiento.Pendiente,
          ]),
          consentimientoReceptor: In([
            EstadoConsentimiento.Aceptado,
            EstadoConsentimiento.Pendiente,
          ]),
          solicitante: { id },
          fechaBaja: null,
        },
        {
          consentimientoUsuario: In([
            EstadoConsentimiento.Aceptado,
            EstadoConsentimiento.Pendiente,
          ]),
          consentimientoSolicitante: In([
            EstadoConsentimiento.Aceptado,
            EstadoConsentimiento.Pendiente,
          ]),
          receptor: { id },
          fechaBaja: null,
        },
      ],
      relations: ['receptor', 'solicitante', 'usuario'],
    });
    return tickets;
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

  async updateTicketConsentimiento(
    userId: number,
    ticketId: number,
    estadoConsentimiento: EstadoConsentimiento,
  ) {
    const ticket = await this.findTicketById(ticketId, userId);

    if (ticket.usuario.id === userId) {
      ticket.consentimientoUsuario = estadoConsentimiento;
    }
    if (ticket.receptor.id === userId) {
      ticket.consentimientoReceptor = estadoConsentimiento;
    }
    if (ticket.solicitante.id === userId) {
      ticket.consentimientoSolicitante = estadoConsentimiento;
    }

    return this.ticketRepository.save(ticket);
  }
}
