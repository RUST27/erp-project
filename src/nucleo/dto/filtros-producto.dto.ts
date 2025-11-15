import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoProducto } from '../../common/enums';
import { PaginacionDto } from '../../common/dtos/paginacion.dto';

export class FiltrosProductoDto extends PaginacionDto {
  @IsString()
  @IsOptional()
  busqueda?: string; // Busca en nombre, SKU o descripción

  @IsEnum(TipoProducto)
  @IsOptional()
  tipo_producto?: TipoProducto;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  esta_activo?: boolean;
}

