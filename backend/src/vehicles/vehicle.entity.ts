import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('vehiculos')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column({ name: 'año' })
  año: number;

  @Column()
  placa: string;

  @Column()
  combustible: string;

  @Column()
  kilometraje: number;
}