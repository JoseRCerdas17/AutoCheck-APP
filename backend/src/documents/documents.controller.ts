import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Guardar un documento para un vehículo' })
  @ApiResponse({ status: 201, description: 'Documento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  @Get(':vehicleId')
  @ApiOperation({ summary: 'Obtener todos los documentos de un vehículo' })
  @ApiResponse({ status: 200, description: 'Lista de documentos' })
  findByVehicle(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    return this.documentsService.findByVehicle(vehicleId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un documento por ID' })
  @ApiResponse({ status: 200, description: 'Documento eliminado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.remove(id);
  }
}