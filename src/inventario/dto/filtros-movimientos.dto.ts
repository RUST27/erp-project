import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { PaginacionDto } from '../../common/dtos/paginacion.dto';
import { TipoDocumentoOrigen } from '../../common/enums';

export class FiltrosMovimientosDto extends PaginacionDto {
  @ApiProperty({
    description: 'Filtrar por ID de producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  producto_id?: string;

  @ApiProperty({
    description: 'Filtrar por ID de almacén de origen',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  almacen_origen_id?: string;

  @ApiProperty({
    description: 'Filtrar por ID de almacén de destino',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  almacen_destino_id?: string;

  @ApiProperty({
    description: 'Filtrar por tipo de documento origen',
    enum: TipoDocumentoOrigen,
    required: false,
  })
  @IsEnum(TipoDocumentoOrigen)
  @IsOptional()
  tipo_documento_origen?: TipoDocumentoOrigen;

  @ApiProperty({
    description: 'Filtrar por ID de documento origen',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id_documento_origen?: string;

  @ApiProperty({
    description: 'Fecha desde (formato ISO 8601)',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fecha_desde?: string;

  @ApiProperty({
    description: 'Fecha hasta (formato ISO 8601)',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fecha_hasta?: string;
}

