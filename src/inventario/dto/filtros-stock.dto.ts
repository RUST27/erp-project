import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginacionDto } from '../../common/dtos/paginacion.dto';

export class FiltrosStockDto extends PaginacionDto {
  @ApiProperty({
    description: 'Filtrar por ID de producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  producto_id?: string;

  @ApiProperty({
    description: 'Filtrar por ID de almacén',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  almacen_id?: string;
}

