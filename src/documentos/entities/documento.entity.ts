import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
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

  @Column({ type: 'blob', nullable: false })
  archivo: Buffer;

  @Column({ nullable: false })
  fechaSubida: Date;

  @Column({ length: 50, nullable: true })
  nombreProfesional: string | null;

  @Column({ length: 50, nullable: true })
  apellidoProfesional: string | null;

  @ManyToOne(() => User, (user) => user.documentos)
  profesional: User | null;

  @ManyToOne(() => User, (user) => user.documentos)
  usuario: User;
}
