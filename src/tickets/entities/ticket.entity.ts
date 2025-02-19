import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { TicketMensaje } from 'src/ticket-mensajes/entities/ticket-mensaje.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  asunto: string;

  @Column({ nullable: false })
  descripcion: string;

  @Column({ nullable: false })
  fechaCreacion: Date;

  @ManyToOne(() => User, (user) => user.ticketsSolicitante)
  solicitante: User;

  @ManyToOne(() => User, (user) => user.ticketsReceptor)
  receptor: User;

  @ManyToOne(() => User, (user) => user.ticketsUsuario)
  usuario: User;

  @Column({ default: false })
  isAutorizado: boolean;

  @Column({ default: false })
  isAceptado: boolean;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => TicketMensaje, (mensaje) => mensaje.ticket)
  mensajes: TicketMensaje[];
}