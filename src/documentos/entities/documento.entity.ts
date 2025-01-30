import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { TipoDocumento } from './tipoDocumentos.enum';

@Entity()
export class Documento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TipoDocumento, nullable: false })
  tipo: TipoDocumento;

  @Column({ length: 100, nullable: false })
  titulo: string;

  @Column({ nullable: false })
  descripcion: string;

  @Column({ nullable: true })
  archivo: string | null;

  @Column({ nullable: true })
  directorio: string | null;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  fechaSubida: Date;

  @Column({ length: 50, nullable: true })
  nombreProfesional: string | null; //por si el profesional no esta registrado en la base de datos

  @Column({ length: 50, nullable: true })
  apellidoProfesional: string | null; //por si el profesional no esta registrado en la base de datos

  @ManyToOne(() => User, (user) => user.documentos)
  profesional: User | null; //si el profesional esta registrado en la base de datos

  @ManyToOne(() => User, (user) => user.documentos)
  usuario: User;

  @ManyToMany(() => User, (user) => user.documentosVisibles)
  visibilidad: User[];
}
