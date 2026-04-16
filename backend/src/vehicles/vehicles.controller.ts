import { Controller, Get, Post, Delete, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post(':usuarioId')
  @ApiOperation({ summary: 'Crear un vehículo para un usuario' })
  @ApiResponse({ status: 201, description: 'Vehículo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Param('usuarioId') usuarioId: string, @Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto, +usuarioId);
  }

  @Get(':usuarioId')
  @ApiOperation({ summary: 'Obtener todos los vehículos de un usuario' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos' })
  findAll(@Param('usuarioId') usuarioId: string) {
    return this.vehiclesService.findAll(+usuarioId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un vehículo por ID' })
  @ApiResponse({ status: 200, description: 'Vehículo eliminado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(+id);
  }

  @Put(':id/kilometraje')
  @ApiOperation({ summary: 'Actualizar el kilometraje de un vehículo' })
  @ApiResponse({ status: 200, description: 'Kilometraje actualizado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  updateKilometraje(@Param('id') id: string, @Body() body: { kilometraje: number }) {
    return this.vehiclesService.updateKilometraje(+id, body.kilometraje);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos de un vehículo' })
  @ApiResponse({ status: 200, description: 'Vehículo actualizado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.vehiclesService.update(+id, dto);
  }
}
