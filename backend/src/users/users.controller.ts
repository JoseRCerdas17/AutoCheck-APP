import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile/:id')
  @ApiOperation({ summary: 'Obtener perfil del usuario' })
  getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña (usuario autenticado)' })
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(+id, dto.currentPassword, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('push-token/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guardar push token del dispositivo' })
  savePushToken(@Param('id') id: string, @Body() body: { pushToken: string }) {
    return this.usersService.savePushToken(+id, body.pushToken);
  }
}