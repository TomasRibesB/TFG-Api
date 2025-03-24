import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { RutinaEjercicio } from "./rutina-ejercicio.entity";

@Entity()
export class Registro {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => RutinaEjercicio, rutinaEjercicio => rutinaEjercicio.registros)
    rutinaEjercicio: RutinaEjercicio;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false
    })
    fecha: Date;
}
