import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  membresia: boolean;

  @Column({ nullable: true })
  pushToken: string;

  @Column({ nullable: true, type: 'varchar' })
  resetToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  resetTokenExpiry: Date | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}