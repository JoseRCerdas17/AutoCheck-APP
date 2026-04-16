import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: string;

  @Column()
  vehicleId!: number;

  @Column({ type: 'date', nullable: true })
  expirationDate!: string;

  @Column({ type: 'text', nullable: true })
  fileUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;
}