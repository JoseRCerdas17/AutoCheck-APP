import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance } from './maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private repo: Repository<Maintenance>,
  ) {}

  async create(dto: CreateMaintenanceDto): Promise<Maintenance> {
    const maintenance = this.repo.create({
      tipo: dto.tipo,
      fecha: dto.fecha ? new Date(dto.fecha) : undefined,
      kilometraje: dto.kilometraje,
      costo: dto.costo,
      notas: dto.notas,
      taller: dto.taller,
      vehiculo: { id: dto.vehiculoId },
    });
    return this.repo.save(maintenance);
  }

  async findAll(vehiculoId: number): Promise<Maintenance[]> {
    return this.repo.find({
      where: { vehiculo: { id: vehiculoId } },
      order: { fecha: 'DESC' },
    });
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}