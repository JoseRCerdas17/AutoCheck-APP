import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(@InjectRepository(Vehicle) private repo: Repository<Vehicle>) {}

  async create(dto: CreateVehicleDto, usuarioId: number): Promise<Vehicle> {
    const vehicle = this.repo.create({
      ...dto,
      usuario: { id: usuarioId },
    });
    return this.repo.save(vehicle);
  }

  async findAll(usuarioId: number): Promise<Vehicle[]> {
    return this.repo.find({
      where: { usuario: { id: usuarioId } },
    });
  }

  async findOne(id: number): Promise<Vehicle | null> {
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async updateKilometraje(id: number, kilometraje: number): Promise<Vehicle> {
    const vehicle = await this.repo.findOne({ where: { id } });
    if (!vehicle) throw new Error('Vehículo no encontrado');
    vehicle.kilometraje = kilometraje;
    return this.repo.save(vehicle);
  }

  async update(id: number, dto: any): Promise<Vehicle> {
    // Mapear 'year' → 'anio' si viene del móvil
    const datos: any = {};
    if (dto.marca !== undefined) datos.marca = dto.marca;
    if (dto.modelo !== undefined) datos.modelo = dto.modelo;
    if (dto.year !== undefined) datos.anio = dto.year;
    if (dto.anio !== undefined) datos.anio = dto.anio;
    if (dto.placa !== undefined) datos.placa = dto.placa;
    if (dto.combustible !== undefined) datos.combustible = dto.combustible;
    if (dto.kilometraje !== undefined) datos.kilometraje = dto.kilometraje;
    if (dto.unidad !== undefined) datos.unidad = dto.unidad;
    if (dto.imagen !== undefined) datos.imagen = dto.imagen;

    await this.repo.update(id, datos);
    const updatedVehicle = await this.repo.findOne({ where: { id } });

    if (!updatedVehicle) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }

    return updatedVehicle;
  }
}
