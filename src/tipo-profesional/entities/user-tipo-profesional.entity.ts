import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { TipoProfesional } from 'src/tipo-profesional/entities/tipo-profesional.entity';

@Entity()
export class UserTipoProfesional {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longblob', nullable: true, select: false })
  archivo: Buffer;

  @Column({ nullable: true })
  certificadora: string;

  @ManyToOne(() => User, (user) => user.userTipoProfesionales)
  user: User;

  @ManyToOne(() => TipoProfesional, (tipoProfesional) => tipoProfesional.userTipoProfesionales)
  tipoProfesional: TipoProfesional;
}