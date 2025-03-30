import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { EstadoConsentimiento } from './entities/estadoConsentimiento.enum';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User } from 'src/users/entities/user.entity';
import { TicketsEmailNotificationService } from './tickets.email.notification.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    private ticketsEmailNotificationService: TicketsEmailNotificationService,
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
          fechaBaja: IsNull(),
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
          fechaBaja: IsNull(),
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
          fechaBaja: IsNull(),
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

    if (
      ticket.consentimientoUsuario === EstadoConsentimiento.Aceptado &&
      ticket.consentimientoReceptor === EstadoConsentimiento.Aceptado &&
      ticket.consentimientoSolicitante === EstadoConsentimiento.Aceptado
    ) {
      this.ticketsEmailNotificationService.enviarNotificacionTicketAprobado(
        ticket,
      );
    }
    if (
      ticket.consentimientoUsuario === EstadoConsentimiento.Rechazado ||
      ticket.consentimientoReceptor === EstadoConsentimiento.Rechazado ||
      ticket.consentimientoSolicitante === EstadoConsentimiento.Rechazado
    ) {
      this.ticketsEmailNotificationService.enviarNotificacionTicketRechazado(
        ticket,
      );
      ticket.fechaBaja = new Date();
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
          fechaBaja: IsNull(),
        },
        {
          solicitante: { id: ticket.receptor.id },
          receptor: { id: ticket.solicitante.id },
          usuario: { id: ticket.usuario.id },
          fechaBaja: IsNull(),
        },
      ],
    });

    if (ticketExistente) {
      throw new UnauthorizedException('Ticket ya existe');
    }

    const newTicket = await this.ticketRepository.save(ticket);

    const ticketresult: Ticket = await this.findTicketById(
      newTicket.id,
      userId,
    );

    this.ticketsEmailNotificationService.enviarNotificacionTicketPendiente(
      ticketresult,
    );

    return ticketresult;
  }

  async bajaTicket(userId: number, ticketId: number): Promise<Ticket> {
    console.log('bajaTicket', userId, ticketId);
    const ticket = await this.findTicketById(ticketId, userId);

    if (ticket.fechaBaja) {
      ticket.fechaBaja = null;
    } else {
      ticket.fechaBaja = new Date();
    }

    const result = await this.ticketRepository.save(ticket);

    await this.ticketsEmailNotificationService.enviarNotificacionTicketArchivado(
      ticket,
    );

    return result;
  }
}
