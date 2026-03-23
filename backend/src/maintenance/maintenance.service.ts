import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance } from './maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private repo: Repository<Maintenance>,
    private notificationsService: NotificationsService,
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

  async getResumen(usuarioId: number): Promise<any> {
    const mantenimientos = await this.repo.find({
      where: { vehiculo: { usuario: { id: usuarioId } } },
      relations: ['vehiculo'],
      order: { fecha: 'DESC' },
    });
  
    const totalGastado = mantenimientos.reduce((sum, m) => sum + Number(m.costo || 0), 0);
    const totalMantenimientos = mantenimientos.length;
    const ultimo = mantenimientos[0] || null;
  
    return {
      totalGastado,
      totalMantenimientos,
      ultimoMantenimiento: ultimo ? {
        tipo: ultimo.tipo,
        fecha: ultimo.fecha,
        taller: ultimo.taller,
        vehiculo: ultimo.vehiculo ? `${ultimo.vehiculo.marca} ${ultimo.vehiculo.modelo}` : '',
      } : null,
    };
  }


  async verificarAlertas(usuarioId: number): Promise<void> {
    const vehiculos = await this.repo.query(
      `SELECT v.* FROM vehiculos v WHERE v.usuario_id = $1`,
      [usuarioId]
    );
  
    for (const v of vehiculos) {
      const mantenimientos = await this.repo.find({
        where: { vehiculo: { id: v.id } },
        order: { fecha: 'DESC' },
      });
  
      const unidad = v.unidad || 'km';
      const kmActual = v.kilometraje || 0;
  
      // Límites según unidad (siempre en km internamente)
      const limites = {
        aceite: unidad === 'mi' ? 3000 * 1.60934 : 5000,
        frenos: unidad === 'mi' ? 25000 * 1.60934 : 40000,
        llantas: unidad === 'mi' ? 37000 * 1.60934 : 60000,
        filtro: unidad === 'mi' ? 9000 * 1.60934 : 15000,
        bateria: unidad === 'mi' ? 31000 * 1.60934 : 50000,
      };
  
      const tiposAVerificar = [
        { key: 'aceite', buscar: 'aceite', label: 'Cambio de aceite', limiteDisplay: unidad === 'mi' ? 3000 : 5000 },
        { key: 'frenos', buscar: 'freno', label: 'Revisión de frenos', limiteDisplay: unidad === 'mi' ? 25000 : 40000 },
        { key: 'llantas', buscar: 'llanta', label: 'Cambio de llantas', limiteDisplay: unidad === 'mi' ? 37000 : 60000 },
        { key: 'filtro', buscar: 'filtro', label: 'Filtro de aire', limiteDisplay: unidad === 'mi' ? 9000 : 15000 },
        { key: 'bateria', buscar: 'bateria', label: 'Cambio de batería', limiteDisplay: unidad === 'mi' ? 31000 : 50000 },
      ];
  
      for (const tipo of tiposAVerificar) {
        const ultimoServicio = mantenimientos.find(m =>
          m.tipo?.toLowerCase().includes(tipo.buscar)
        );
  
        if (ultimoServicio) {
          const kmDesde = kmActual - (ultimoServicio.kilometraje || 0);
          if (kmDesde >= limites[tipo.key]) {
            const recorridoDisplay = unidad === 'mi'
              ? Math.round(kmDesde * 0.621371).toLocaleString()
              : Math.round(kmDesde).toLocaleString();
  
            await this.notificationsService.enviarNotificacionAUsuario(
              usuarioId,
              `⚠️ ${tipo.label} urgente`,
              `${v.marca} ${v.modelo}: ${recorridoDisplay} ${unidad} desde el último servicio (límite: ${tipo.limiteDisplay.toLocaleString()} ${unidad})`,
              { vehiculoId: v.id }
            );
          }
        } else {
          const recorridoDisplay = unidad === 'mi'
            ? Math.round(kmActual * 0.621371).toLocaleString()
            : Math.round(kmActual).toLocaleString();
  
          if (kmActual >= limites[tipo.key]) {
            await this.notificationsService.enviarNotificacionAUsuario(
              usuarioId,
              `⚠️ ${tipo.label} pendiente`,
              `${v.marca} ${v.modelo}: Sin registro de ${tipo.label.toLowerCase()} (${recorridoDisplay} ${unidad})`,
              { vehiculoId: v.id }
            );
          }
        }
      }
    }
  }
}