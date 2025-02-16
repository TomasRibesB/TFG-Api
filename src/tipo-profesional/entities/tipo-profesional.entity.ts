import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserTipoProfesional } from './user-tipo-profesional.entity';
import { Documento } from 'src/documentos/entities/documento.entity';

@Entity()
export class TipoProfesional {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: false })
  profesion: string;

  @OneToMany(
    () => UserTipoProfesional,
    (userTipoProfesional) => userTipoProfesional.tipoProfesional,
  )
  userTipoProfesionales: UserTipoProfesional[];

  @OneToMany(() => Documento, (documento) => documento.tipoProfesional)
  documentos: Documento[];
}
