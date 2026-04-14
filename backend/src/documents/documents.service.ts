import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentsRepository: Repository<Document>,
  ) {}

  // Guardar un documento nuevo asociado a un vehículo
  async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
    const document = this.documentsRepository.create(createDocumentDto);
    return this.documentsRepository.save(document);
  }

  // Listar todos los documentos de un vehículo específico
  async findByVehicle(vehicleId: number): Promise<Document[]> {
    return this.documentsRepository.find({
      where: { vehicleId },
      order: { createdAt: 'DESC' },
    });
  }

  // Eliminar un documento por su ID
  async remove(id: number): Promise<{ message: string }> {
    const document = await this.documentsRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Documento con id ${id} no encontrado`);
    }
    await this.documentsRepository.remove(document);
    return { message: `Documento ${id} eliminado correctamente` };
  }
}