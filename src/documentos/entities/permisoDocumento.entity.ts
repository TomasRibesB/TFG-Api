import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class PermisoDocumento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: false })
  code: string;

  @ManyToOne(() => User, (user) => user.documentos)
  usuario: User;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  fechaAlta: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  fechaBaja: Date;
}
