import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Post()
  create(@Body() dto: CreateMaintenanceDto) {
    return this.maintenanceService.create(dto);
  }

  @Get('resumen/:usuarioId')
  getResumen(@Param('usuarioId') usuarioId: string) {
    return this.maintenanceService.getResumen(+usuarioId);
  }

  @Get(':vehiculoId')
  findAll(@Param('vehiculoId') vehiculoId: string) {
    return this.maintenanceService.findAll(+vehiculoId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(+id);
  }

  @Get('verificar-alertas/:usuarioId')
verificarAlertas(@Param('usuarioId') usuarioId: string) {
  return this.maintenanceService.verificarAlertas(+usuarioId);
}
}