import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { Ejercicio } from "src/ejercicios/entities/ejercicio.entity";

@Entity()
export class GruposMusculares {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, nullable: false })
    name: string;

    // This is a one-to-many relationship with the Ejercicio entity
    @ManyToMany(() => Ejercicio, ejercicio => ejercicio.gruposMusculares)
    ejercicios: Ejercicio[];
}
