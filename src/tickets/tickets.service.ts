import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { EstadoConsentimiento } from './entities/estadoConsentimiento.enum';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User } from 'src/users/entities/user.entity';

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

  async createTicket(userId: number, createTicketDto: CreateTicketDto) {
    // Mapear el DTO a la entidad Ticket
    const ticket = new Ticket();
    ticket.asunto = createTicketDto.asunto;
    ticket.descripcion = createTicketDto.descripcion;
    ticket.fechaCreacion = new Date(createTicketDto.fechaCreacion);
    ticket.solicitante = { id: userId } as User;
    ticket.receptor = { id: createTicketDto.receptor.id } as User;
    ticket.usuario = { id: createTicketDto.usuario.id } as User;
    if (ticket.usuario.id === userId) {
      ticket.consentimientoUsuario = EstadoConsentimiento.Aceptado;
    } else {
      ticket.consentimientoUsuario = EstadoConsentimiento.Pendiente;
    }
    ticket.consentimientoReceptor = EstadoConsentimiento.Pendiente;
    ticket.consentimientoSolicitante = EstadoConsentimiento.Aceptado;

    if (ticket.solicitante.id !== userId) {
      throw new UnauthorizedException('Usuario no puede crear ticket');
    }
    if (ticket.solicitante.id === ticket.receptor.id) {
      throw new UnauthorizedException(
        'Usuario no puede crear ticket consigo mismo',
      );
    }
    if (
      ticket.solicitante.id === 0 ||
      ticket.receptor.id === 0 ||
      ticket.usuario.id === 0
    ) {
      throw new UnauthorizedException('Usuario no puede ser 0');
    }

    //verifico que no haya una combinacion de usuarios repetida no importa el orden
    const ticketExistente = await this.ticketRepository.findOne({
      where: [
        {
          solicitante: { id: ticket.solicitante.id },
          receptor: { id: ticket.receptor.id },
          usuario: { id: ticket.usuario.id },
        },
        {
          solicitante: { id: ticket.receptor.id },
          receptor: { id: ticket.solicitante.id },
          usuario: { id: ticket.usuario.id },
        },
      ],
    });

    if (ticketExistente) {
      throw new UnauthorizedException('Ticket ya existe');
    }

    // Se fuerza el consentimiento del solicitante a "Aceptado"
    ticket.consentimientoSolicitante = EstadoConsentimiento.Aceptado;

    if (ticket.usuario.id === userId) {
      ticket.consentimientoUsuario = EstadoConsentimiento.Aceptado;
    }

    const newTicket = await this.ticketRepository.save(ticket);

    return await this.findTicketById(newTicket.id, userId);
  }
}
