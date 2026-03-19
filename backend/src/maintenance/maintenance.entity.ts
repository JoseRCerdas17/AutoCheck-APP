import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';

@Entity('mantenimientos')
export class Maintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo: Vehicle;

  @Column()
  tipo: string;

  @Column({ nullable: true })
  fecha: Date;

  @Column({ nullable: true })
  kilometraje: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costo: number;

  @Column({ nullable: true })
  notas: string;

  @Column({ nullable: true })
  taller: string;
}