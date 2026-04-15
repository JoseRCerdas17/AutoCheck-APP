import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  marca: string;

  @IsString()
  modelo: string;

  @IsOptional()
  @IsNumber()
  anio?: number;

  @IsOptional()
  @IsString()
  placa?: string;

  @IsString()
  combustible: string;

  @IsNumber()
  kilometraje: number;

  @IsOptional()
  @IsString()
  unidad?: string;

  @IsOptional()
  @IsString()
  imagen?: string;
}