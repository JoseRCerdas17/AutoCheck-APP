import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('maintenance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un registro de mantenimiento' })
  @ApiResponse({ status: 201, description: 'Mantenimiento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() dto: CreateMaintenanceDto) {
    return this.maintenanceService.create(dto);
  }

  @Get('resumen/:usuarioId')
  @ApiOperation({ summary: 'Obtener resumen de mantenimiento por usuario' })
  @ApiResponse({ status: 200, description: 'Resumen de mantenimiento' })
  getResumen(@Param('usuarioId') usuarioId: string) {
    return this.maintenanceService.getResumen(+usuarioId);
  }

  @Get(':vehiculoId')
  @ApiOperation({ summary: 'Listar mantenimientos de un vehículo' })
  @ApiResponse({ status: 200, description: 'Lista de mantenimientos' })
  findAll(@Param('vehiculoId') vehiculoId: string) {
    return this.maintenanceService.findAll(+vehiculoId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un mantenimiento por ID' })
  @ApiResponse({ status: 200, description: 'Mantenimiento eliminado' })
  @ApiResponse({ status: 404, description: 'Mantenimiento no encontrado' })
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(+id);
  }

  @Get('verificar-alertas/:usuarioId')
  @ApiOperation({ summary: 'Verificar alertas de mantenimiento por usuario' })
  @ApiResponse({ status: 200, description: 'Alertas de mantenimiento' })
  verificarAlertas(@Param('usuarioId') usuarioId: string) {
    return this.maintenanceService.verificarAlertas(+usuarioId);
  }
}
