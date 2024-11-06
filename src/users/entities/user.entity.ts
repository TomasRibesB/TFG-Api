import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.enum";
import { Routine } from "src/routines/entities/routine.entity";
import { Turno } from "src/turnos/entities/turno.entity";
import { Ticket } from "src/tickets/entities/ticket.entity";
import { TicketMensaje } from "src/ticket-mensajes/entities/ticket-mensaje.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, nullable: false})
    firstName: string;

    @Column({ length: 50, nullable: false })
    lastName: string;

    @Column({ length: 50, unique:true, nullable: false })
    dni: string;

    @Column({ length: 300, nullable: false })
    password: string;

    @Column({ length: 50, nullable: false })
    email: string;

    @Column({ type: 'enum', enum: Role, default: Role.Usuario })
    role: Role;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Routine, routine => routine.user)
    routines?: Routine[];

    @OneToMany(() => Turno, turno => turno.paciente)
    turnosPaciente?: Turno[];
  
    @OneToMany(() => Turno, turno => turno.profesional)
    turnosProfesional?: Turno[];

    @OneToMany(() => Ticket, ticket => ticket.usuario)
    tickets?: Ticket[];

    @OneToMany(() => TicketMensaje, mensaje => mensaje.emisor)
    mensajesEnviados?: TicketMensaje[];
}
