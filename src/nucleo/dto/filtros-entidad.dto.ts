import { IsOptional, IsString, IsEnum } from 'class-validator';
import { TipoEntidad, TipoRol } from '../../common/enums';
import { PaginacionDto } from '../../common/dtos/paginacion.dto';

export class FiltrosEntidadDto extends PaginacionDto {
  @IsString()
  @IsOptional()
  busqueda?: string; // Busca en nombre o email

  @IsEnum(TipoEntidad)
  @IsOptional()
  tipo_entidad?: TipoEntidad;

  @IsEnum(TipoRol)
  @IsOptional()
  tipo_rol?: TipoRol; // Filtrar por rol (CLIENTE, PROVEEDOR, EMPLEADO)
}

