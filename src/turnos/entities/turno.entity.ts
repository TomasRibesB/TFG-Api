import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { EstadoTurno } from './estadosTurnos.enum';

@Entity()
export class Turno {
  @PrimaryGeneratedColumn()
  id: number;

  //datetime fechaHora
  @Column({ nullable: false, type: 'datetime' })
  fechaHora: Date;

  @Column({ type: 'enum', enum: EstadoTurno, default: EstadoTurno.Pendiente })
  estado: EstadoTurno;

  @Column({ nullable: true })
  notificado: Date | null;

  @ManyToOne(() => User, (user) => user.turnosPaciente)
  paciente: User;

  @ManyToOne(() => User, (user) => user.turnosProfesional)
  profesional: User;
}
