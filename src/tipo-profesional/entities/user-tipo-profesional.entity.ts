import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { TipoProfesional } from 'src/tipo-profesional/entities/tipo-profesional.entity';

@Entity()
export class UserTipoProfesional {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  archivo: string;

  @Column({ nullable: true })
  directorio: string;

  @Column({ nullable: true })
  certificadora: string;

  @ManyToOne(() => User, (user) => user.userTipoProfesionales)
  user: User;

  @ManyToOne(() => TipoProfesional, (tipoProfesional) => tipoProfesional.userTipoProfesionales)
  tipoProfesional: TipoProfesional;
}