import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { TicketMensaje } from 'src/ticket-mensajes/entities/ticket-mensaje.entity';
import { EstadoConsentimiento } from './estadoConsentimiento.enum';
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

  @Column({
    type: 'enum',
    enum: EstadoConsentimiento,
    nullable: false,
    default: EstadoConsentimiento.Pendiente,
  })
  consentimientoUsuario: EstadoConsentimiento;

  @Column({
    type: 'enum',
    enum: EstadoConsentimiento,
    nullable: false,
    default: EstadoConsentimiento.Pendiente,
  })
  consentimientoReceptor: EstadoConsentimiento;

  @Column({
    type: 'enum',
    enum: EstadoConsentimiento,
    nullable: false,
    default: EstadoConsentimiento.Aceptado,
  })
  consentimientoSolicitante: EstadoConsentimiento;

  @Column({ type: 'timestamp', nullable: true })
  fechaBaja: Date | null;

  @OneToMany(() => TicketMensaje, (mensaje) => mensaje.ticket)
  mensajes: TicketMensaje[];
}
