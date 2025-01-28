import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";
import { RutinaEjercicio } from "src/rutina-ejercicio/entities/rutina-ejercicio.entity";
import { User } from "src/users/entities/user.entity";

@Entity()
export class Routine {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, nullable: false })
    name: string;

    @Column({ length: 300, nullable: true })
    description?: string;

    @OneToMany(() => RutinaEjercicio, rutinaEjercicio => rutinaEjercicio.routine)
    rutinaEjercicio?: RutinaEjercicio[];

    @ManyToOne(() => User, user => user.routines)
    user: User;

    @ManyToOne(() => User, user => user.routines)
    trainer: User;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false
    })
    createdAt: Date;
}
