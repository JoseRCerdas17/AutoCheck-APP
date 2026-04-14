import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ example: 'RITEVE', description: 'Tipo de documento' })
  @IsNotEmpty()
  @IsString()
  type!: string;

  @ApiProperty({ example: 1, description: 'ID del vehículo' })
  @IsNotEmpty()
  @IsNumber()
  vehicleId!: number;

  @ApiProperty({ example: '2025-12-31', description: 'Fecha de vencimiento', required: false })
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiProperty({ example: 'https://...', description: 'URL del archivo', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}