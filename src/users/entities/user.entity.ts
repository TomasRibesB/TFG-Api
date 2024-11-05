import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true, nullable: false})
    nombre: string;

    @Column({ length: 300, nullable: false })
    password: string;

    @Column({ length: 50, nullable: false })
    email: string;

    @Column({ length: 50, default: 'user', nullable: false})
    role: string;

    @Column({ default: false, nullable: false })
    isMuted: boolean;

    @DeleteDateColumn()
    deletedAt: Date;
}
