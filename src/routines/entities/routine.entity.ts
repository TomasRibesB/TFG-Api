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

    @OneToMany(() => RutinaEjercicio, ejercicioRegistro => ejercicioRegistro.routine)
    ejerciciosRegistros?: RutinaEjercicio[];

    @ManyToOne(() => User, user => user.routines)
    user: User;
}
