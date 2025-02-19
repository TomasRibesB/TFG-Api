import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';
import { EstadoMensaje } from './estadoMensaje.enum';

@Entity()
export class TicketMensaje {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  idRef: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.mensajes)
  ticket: Ticket;

  @Column({ type: 'datetime', nullable: false })
  fecha: Date;

  @ManyToOne(() => User, (user) => user.mensajesEnviados, {
    eager: true,
  })
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
