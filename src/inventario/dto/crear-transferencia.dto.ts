import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsPositive,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CrearTransferenciaDto {
  @ApiProperty({
    description: 'ID del producto a transferir',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  producto_id: string;

  @ApiProperty({
    description: 'ID del almacén de origen',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @ValidateIf((o) => o.almacen_origen_id !== null)
  @IsOptional()
  almacen_origen_id?: string;

  @ApiProperty({
    description: 'ID del almacén de destino',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsUUID()
  @ValidateIf((o) => o.almacen_destino_id !== null)
  @IsOptional()
  almacen_destino_id?: string;

  @ApiProperty({
    description: 'Cantidad a transferir (debe ser mayor a 0)',
    example: 10.5,
    minimum: 0.0001,
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  @Type(() => Number)
  cantidad: number;

  @ApiProperty({
    description: 'Notas o comentarios sobre la transferencia',
    example: 'Transferencia de stock entre almacenes',
    required: false,
  })
  @IsOptional()
  notas?: string;
}

