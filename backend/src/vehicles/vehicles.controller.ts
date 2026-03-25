import { Controller, Get, Post, Delete, Put, Body, Param, UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post(':usuarioId')
  create(@Param('usuarioId') usuarioId: string, @Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto, +usuarioId);
  }

  @Get(':usuarioId')
  findAll(@Param('usuarioId') usuarioId: string) {
    return this.vehiclesService.findAll(+usuarioId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.vehiclesService.update(+id, dto);
  }
}
