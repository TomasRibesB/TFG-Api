import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class PlanNutricional {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  fechaCreacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaBaja: Date | null;

  @Column({ length: 100, nullable: false })
  nombre: string;

  @Column({ type: 'text', nullable: false })
  descripcion: string;

  @Column({ nullable: false })
  pacienteId: number;

  @Column({ type: 'text', nullable: false })
  objetivos: string;

  @Column({ type: 'float', nullable: false })
  caloriasDiarias: number;

  @Column('simple-json', { nullable: false })
  macronutrientes: { [key: string]: number };

  @Column({ type: 'text', nullable: true })
  notasAdicionales: string;

  @ManyToOne(() => User, (user) => user.planesNutricionales)
  nutricionista: User;

  @ManyToOne(() => User, (user) => user.planesNutricionalesPaciente)
  paciente: User;

  @ManyToMany(() => User, (user) => user.planesNutricionalesVisibles)
  @JoinTable()
  visibilidad: User[];
}
