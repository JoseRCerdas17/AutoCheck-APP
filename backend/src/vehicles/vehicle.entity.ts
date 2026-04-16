import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('vehiculos')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: User;

  @Column()
  marca!: string;

  @Column()
  modelo!: string;

  @Column({ name: 'anio', nullable: true })
  anio!: number;

  @Column({ nullable: true })
  placa!: string;

  @Column({ nullable: true })
  combustible!: string;

  @Column({ nullable: true })
  kilometraje!: number;

  @Column({ type: 'text', nullable: true })
  imagen!: string;

  @Column({ default: 'km' })
  unidad!: string;
}