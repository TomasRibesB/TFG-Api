import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';

export enum EstadoMensaje {
  Enviado = 'Enviado',
  Enviando = 'Enviando',
  NoEnviado = 'No Enviado',
  Oculto = 'Oculto',
}

@Entity()
export class TicketMensaje {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ticket, (ticket) => ticket.mensajes)
  ticket: Ticket;

  @Column({ type: 'datetime', nullable: false })
  fecha: Date;

  @ManyToOne(() => User, (user) => user.mensajesEnviados)
  emisor: User;

  @Column({
    type: 'enum',
    enum: EstadoMensaje,
    default: EstadoMensaje.Enviando,
  })
  estado: EstadoMensaje;

  @Column({ nullable: false })
  mensaje: string;
}
