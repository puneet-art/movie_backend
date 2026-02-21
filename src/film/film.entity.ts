import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('film')
export class Film {
    @PrimaryGeneratedColumn({ name: 'film_id' })
    filmId: number;

    @Column({ name: 'title', type: 'varchar', length: 255 })
    title: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'release_year', type: 'int', nullable: true })
    releaseYear: number;

    @UpdateDateColumn({ name: 'last_update', type: 'timestamp' })
    lastUpdate: Date;
}
