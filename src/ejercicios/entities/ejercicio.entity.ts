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
import { UnidadMedida } from './unidadMedida.enum';

@Entity()
export class Ejercicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: false })
  name: string;

  @Column({ length: 300, nullable: true })
  description?: string;

  @Column({ length: 300, nullable: true })
  image?: string;

  @Column({ length: 1000, nullable: true })
  keywords?: string;

  // This is a one-to-many relationship with the RutinaEjercicio entity
  @OneToMany(
    () => RutinaEjercicio,
    (ejercicioRegistro) => ejercicioRegistro.ejercicio,
  )
  ejerciciosRegistros: RutinaEjercicio[];

  // This is a many-to-one relationship with the CategoriaEjercicio entity
  @ManyToMany(
    () => CategoriaEjercicio,
    (categoriaEjercicio) => categoriaEjercicio.ejercicios,
  )
  @JoinTable()
  categoriaEjercicio: CategoriaEjercicio;

  // This is a many-to-one relationship with the GruposMusculares entity
  @ManyToMany(
    () => GruposMusculares,
    (GruposMusculares) => GruposMusculares.ejercicios,
  )
  @JoinTable()
  gruposMusculares: GruposMusculares[];

  @Column({ type: 'enum', enum: UnidadMedida, nullable: false })
  unidadMedida: UnidadMedida;
}
