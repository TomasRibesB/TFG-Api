import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.enum';
import { Routine } from 'src/routines/entities/routine.entity';
import { Turno } from 'src/turnos/entities/turno.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { TicketMensaje } from 'src/ticket-mensajes/entities/ticket-mensaje.entity';
import { PlanNutricional } from 'src/plan-nutricional/entities/plan-nutricional.entity';
import { Documento } from 'src/documentos/entities/documento.entity';
import { UserTipoProfesional } from 'src/tipo-profesional/entities/user-tipo-profesional.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: false })
  firstName: string;

  @Column({ length: 50, nullable: false })
  lastName: string;

  @Column({ length: 50, unique: true, nullable: false })
  dni: string;

  @Column({ length: 300, nullable: false })
  password: string;

  @Column({ length: 50, nullable: false })
  email: string;

  @Column({ type: 'enum', enum: Role, default: Role.Usuario })
  role: Role;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Routine, (routine) => routine.user)
  routines?: Routine[];

  @OneToMany(() => Routine, (routine) => routine.trainer)
  routinesTrainer?: Routine[];

  @OneToMany(() => Turno, (turno) => turno.paciente)
  turnosPaciente?: Turno[];

  @OneToMany(() => Turno, (turno) => turno.profesional)
  turnosProfesional?: Turno[];

  @OneToMany(() => Ticket, (ticket) => ticket.usuario)
  tickets?: Ticket[];

  @OneToMany(() => TicketMensaje, (mensaje) => mensaje.emisor)
  mensajesEnviados?: TicketMensaje[];

  @OneToMany(
    () => PlanNutricional,
    (planNutricional) => planNutricional.nutricionista,
  )
  planesNutricionales?: PlanNutricional[];

  @OneToMany(
    () => PlanNutricional,
    (planNutricional) => planNutricional.paciente,
  )
  planesNutricionalesPaciente?: PlanNutricional[];

  @OneToMany(() => Documento, (documento) => documento.usuario)
  documentos?: Documento[];

  @ManyToMany(() => Documento, (documento) => documento.visibilidad)
  documentosVisibles?: Documento[];

  @ManyToMany(() => User, (user) => user.profesionales)
  @JoinTable()
  usuarios: User[];

  @ManyToMany(() => User, (user) => user.usuarios)
  profesionales: User[];

  //tipo profesional
  @OneToMany(() => UserTipoProfesional, (userTipoProfesional) => userTipoProfesional.user)
  userTipoProfesionales: UserTipoProfesional[];
}
