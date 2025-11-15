import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TipoProducto } from '../../common/enums';

export class CrearProductoDto {
  @ApiProperty({
    description: 'SKU (Stock Keeping Unit) - Código único del producto',
    example: 'PROD-001',
  })
  @IsString()
  @IsNotEmpty({ message: 'El SKU es requerido' })
  sku: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Producto Ejemplo',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción detallada del producto',
    example: 'Descripción del producto',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de producto',
    enum: TipoProducto,
    example: TipoProducto.ALMACENABLE,
  })
  @IsEnum(TipoProducto, { message: 'Tipo de producto inválido' })
  tipo_producto: TipoProducto;

  @ApiProperty({
    description: 'Precio de venta por defecto',
    example: 100.50,
    minimum: 0,
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Type(() => Number)
  @Min(0, { message: 'El precio de venta debe ser mayor o igual a 0' })
  @IsOptional()
  precio_venta_defecto?: number;

  @ApiProperty({
    description: 'Precio de costo por defecto',
    example: 50.25,
    minimum: 0,
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Type(() => Number)
  @Min(0, { message: 'El precio de costo debe ser mayor o igual a 0' })
  @IsOptional()
  precio_costo_defecto?: number;

  @ApiProperty({
    description: 'Indica si el producto está activo',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  esta_activo?: boolean;
}

