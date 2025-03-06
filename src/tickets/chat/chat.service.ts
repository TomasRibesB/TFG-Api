// chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { TicketMensaje } from 'src/ticket-mensajes/entities/ticket-mensaje.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,

    @InjectRepository(TicketMensaje)
    private readonly ticketMensajeRepository: Repository<TicketMensaje>,
  ) {}

  // Método para obtener un ticket y validar que el usuario pertenece a él
  async getTicket(ticketId: string): Promise<Ticket> {
    return this.ticketRepository.findOne({
      where: { id: Number(ticketId) },
      relations: ['solicitante', 'receptor', 'usuario'],
    });
  }

  // Método para guardar el mensaje en la BD
  async saveMessage(data: any): Promise<TicketMensaje> {
    // data = { idRef, ticket: {id}, fecha, emisor: {id}, estado, mensaje }
    const ticket = await this.ticketRepository.findOne({
      where: { id: data.ticket.id },
    });
    if (!ticket) {
      throw new Error(`Ticket con id=${data.ticket.id} no encontrado`);
    }
    const nuevoMensaje = this.ticketMensajeRepository.create({
      idRef: data.idRef,
      ticket: { id: ticket.id },
      fecha: data.fecha ? new Date(data.fecha) : new Date(),
      emisor: { id: data.emisor.id },
      estado: data.estado,
      mensaje: data.mensaje,
    });
    const savedMensaje = await this.ticketMensajeRepository.save(nuevoMensaje);
    // Vuelve a consultar para cargar la relación "emisor" completa (firstName, lastName, etc.)
    return this.ticketMensajeRepository
      .createQueryBuilder('mensaje')
      .leftJoin('mensaje.emisor', 'emisor')
      .addSelect(['emisor.id', 'emisor.firstName', 'emisor.lastName'])
      .where('mensaje.id = :id', { id: savedMensaje.id })
      .getOne();
  }
}
