import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile/:id')
  getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('push-token/:id')
  savePushToken(@Param('id') id: string, @Body() body: { pushToken: string }) {
    return this.usersService.savePushToken(+id, body.pushToken);
  }
}