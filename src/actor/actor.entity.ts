import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('actor')
export class Actor {
  @PrimaryGeneratedColumn({ name: 'actor_id' })
  actorId: number;

  @Column({ name: 'first_name', type: 'varchar', length: 45 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 45 })
  lastName: string;

  @UpdateDateColumn({ name: 'last_update', type: 'timestamp' })
  lastUpdate: Date;
}
