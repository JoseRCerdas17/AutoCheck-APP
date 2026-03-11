import { Injectable } from '@nestjs/common';
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
}