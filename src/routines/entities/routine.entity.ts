import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Routine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(
    () => RutinaEjercicio,
    (rutinaEjercicio) => rutinaEjercicio.routine,
    { cascade: true },
  )
  rutinaEjercicio?: RutinaEjercicio[];

  @ManyToOne(() => User, (user) => user.routines)
  user: User;

  @ManyToOne(() => User, (user) => user.routinesTrainer)
  trainer: User;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaBaja: Date | null;

  @ManyToMany(() => User, (user) => user.routinesVisibles)
  @JoinTable()
  visibilidad: User[];
}
