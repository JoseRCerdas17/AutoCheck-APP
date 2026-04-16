import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaintenanceDto {
  @ApiProperty({ example: 1, description: 'ID del vehículo' })
  @IsNumber()
  vehiculoId: number;

  @ApiProperty({ example: 'Cambio de aceite' })
  @IsString()
  tipo: string;

  @ApiProperty({ example: '2025-06-15', required: false })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiProperty({ example: 55000, required: false, description: 'Kilometraje al momento del mantenimiento' })
  @IsOptional()
  @IsNumber()
  kilometraje?: number;

  @ApiProperty({ example: 25000, required: false, description: 'Costo en colones' })
  @IsOptional()
  @IsNumber()
  costo?: number;

  @ApiProperty({ example: 'Cambio de filtro incluido', required: false })
  @IsOptional()
  @IsString()
  notas?: string;

  @ApiProperty({ example: 'Taller García', required: false })
  @IsOptional()
  @IsString()
  taller?: string;
}