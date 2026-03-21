import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(private usersService: UsersService) {}

  async enviarNotificacion(pushToken: string, titulo: string, cuerpo: string, datos: any = {}) {
    const message = {
      to: pushToken,
      sound: 'default',
      title: titulo,
      body: cuerpo,
      data: datos,
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  }

  async enviarNotificacionATodos(titulo: string, cuerpo: string, datos: any = {}) {
    const usuarios = await this.usersService.getUsersWithPushTokens();
    for (const usuario of usuarios) {
      if (usuario.pushToken) {
        await this.enviarNotificacion(usuario.pushToken, titulo, cuerpo, datos);
      }
    }
  }


  async enviarNotificacionAUsuario(userId: number, titulo: string, cuerpo: string, datos: any = {}) {
    const usuario = await this.usersService.findById(userId);
    if (usuario?.pushToken) {
      await this.enviarNotificacion(usuario.pushToken, titulo, cuerpo, datos);
    }
  }
}