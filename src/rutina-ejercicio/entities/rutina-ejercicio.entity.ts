import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Routine } from "src/routines/entities/routine.entity";
import { Ejercicio } from "src/ejercicios/entities/ejercicio.entity";

@Entity()
export class RutinaEjercicio {
    @PrimaryGeneratedColumn()
    id: number;

    // This is a many-to-one relationship with the Routine entity
    @ManyToOne(() => Routine, routine => routine.rutinaEjercicio)
    routine: Routine;

    // This is a many-to-one relationship with the Ejercicio entity
    @ManyToOne(() => Ejercicio, ejercicio => ejercicio.ejercicioRutina)
    ejercicio: Ejercicio;

    @Column({ type: 'date', nullable: false })
    fecha: Date;

    //series repeticiones medicion string para que sean flexibles
    @Column({ type: 'int', nullable: false })
    series: number;

    @Column({ type: 'int', nullable: false })
    repeticiones: number;

    @Column({ type: 'varchar', nullable: true })
    medicion: string;

}
