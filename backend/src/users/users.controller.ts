import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/profile/:id - Devuelve el perfil del usuario sin la contraseña
  @Get('profile/:id')
  getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(+id);
  }
}