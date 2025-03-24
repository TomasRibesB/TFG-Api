import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';
import { CategoriaEjercicio } from 'src/categoria-ejercicios/entities/categoria-ejercicio.entity';
import { GruposMusculares } from 'src/grupos-musculares/entities/grupos-musculare.entity';

@Entity()
export class Ejercicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120, nullable: false })
  name: string;

  @Column({ length: 300, nullable: true })
  demostration?: string;

  @Column({ length: 300, nullable: true })
  explication?: string;

  @OneToMany(
    () => RutinaEjercicio,
    (ejercicioRutina) => ejercicioRutina.ejercicio,
  )
  ejercicioRutina?: RutinaEjercicio[];

  @ManyToMany(
    () => CategoriaEjercicio,
    (categoriaEjercicio) => categoriaEjercicio.ejercicios,
  )
  @JoinTable()
  categoriaEjercicio: CategoriaEjercicio[];

  @ManyToMany(
    () => GruposMusculares,
    (GruposMusculares) => GruposMusculares.ejercicios,
  )
  @JoinTable()
  gruposMusculares: GruposMusculares[];
}
