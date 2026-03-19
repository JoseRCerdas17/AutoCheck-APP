import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateMaintenanceDto {
  @IsNumber()
  vehiculoId: number;

  @IsString()
  tipo: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsNumber()
  kilometraje?: number;

  @IsOptional()
  @IsNumber()
  costo?: number;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsString()
  taller?: string;
}