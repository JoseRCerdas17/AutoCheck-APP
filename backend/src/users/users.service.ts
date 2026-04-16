import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  // Busca usuario por email - usado por autenticación
  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  // Crea y guarda un nuevo usuario
  async create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  // Busca usuario por id
  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  // GET /users/profile/:id - Devuelve el perfil sin la contraseña
  async getProfile(id: number) {
    const user = await this.repo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    

    const { password, ...profile } = user;
    return profile;
  }



  async saveResetToken(userId: number, token: string, expiry: Date): Promise<void> {
    await this.repo.update(userId, { resetToken: token, resetTokenExpiry: expiry });
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await this.repo.update(userId, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('La contraseña actual es incorrecta');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.repo.update(userId, { password: hashed });
    return { message: 'Contraseña actualizada exitosamente' };
  }

  async savePushToken(userId: number, pushToken: string): Promise<void> {
    await this.repo.update(userId, { pushToken });
  }
  
  async getUsersWithPushTokens(): Promise<User[]> {
    return this.repo
      .createQueryBuilder('user')
      .where('user.pushToken IS NOT NULL')
      .getMany();
  }
}