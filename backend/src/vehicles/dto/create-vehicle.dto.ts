import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  marca: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  modelo: string;

  @ApiProperty({ example: 2020, required: false })
  @IsOptional()
  @IsNumber()
  anio?: number;

  @ApiProperty({ example: 'ABC-123', required: false })
  @IsOptional()
  @IsString()
  placa?: string;

  @ApiProperty({ example: 'Gasolina' })
  @IsString()
  combustible: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  kilometraje: number;

  @ApiProperty({ example: 'km', required: false })
  @IsOptional()
  @IsString()
  unidad?: string;

  @ApiProperty({ example: 'data:image/jpeg;base64,...', required: false, description: 'Imagen en base64' })
  @IsOptional()
  @IsString()
  imagen?: string;
}