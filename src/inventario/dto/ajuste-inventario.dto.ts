import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoAjuste {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
}

export class AjusteInventarioDto {
  @ApiProperty({
    description: 'ID del producto a ajustar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  producto_id: string;

  @ApiProperty({
    description: 'ID del almacén donde se realiza el ajuste',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  almacen_id: string;

  @ApiProperty({
    description: 'Tipo de ajuste: ENTRADA (suma stock) o SALIDA (resta stock)',
    enum: TipoAjuste,
    example: TipoAjuste.ENTRADA,
  })
  @IsEnum(TipoAjuste)
  @IsNotEmpty()
  tipo_ajuste: TipoAjuste;

  @ApiProperty({
    description: 'Cantidad a ajustar (debe ser mayor a 0)',
    example: 10.5,
    minimum: 0.0001,
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  @Type(() => Number)
  cantidad: number;

  @ApiProperty({
    description: 'Motivo del ajuste',
    example: 'Corrección por inventario físico',
    required: false,
  })
  @IsString()
  @IsOptional()
  motivo?: string;
}

