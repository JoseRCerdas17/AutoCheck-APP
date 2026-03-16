import { IsString, IsNumber } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  marca: string;

  @IsString()
  modelo: string;

  @IsNumber()
  anio: number;

  @IsString()
  placa: string;

  @IsString()
  combustible: string;

  @IsNumber()
  kilometraje: number;
}