import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsPositive,
  IsNumber,
  IsOptional,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoDocumentoOrigen } from '../../common/enums';

export class CrearMovimientoDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  producto_id: string;

  @ApiProperty({
    description: 'ID del almacén de origen (NULL para entradas)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @ValidateIf((o) => o.almacen_origen_id !== null)
  @IsOptional()
  almacen_origen_id?: string;

  @ApiProperty({
    description: 'ID del almacén de destino (NULL para salidas)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsUUID()
  @ValidateIf((o) => o.almacen_destino_id !== null)
  @IsOptional()
  almacen_destino_id?: string;

  @ApiProperty({
    description: 'Cantidad del movimiento (debe ser mayor a 0)',
    example: 10.5,
    minimum: 0.0001,
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  @Type(() => Number)
  cantidad: number;

  @ApiProperty({
    description: 'Tipo de documento origen',
    enum: TipoDocumentoOrigen,
    required: false,
  })
  @IsEnum(TipoDocumentoOrigen)
  @IsOptional()
  tipo_documento_origen?: TipoDocumentoOrigen;

  @ApiProperty({
    description: 'ID del documento origen (pedido, orden, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id_documento_origen?: string;
}

