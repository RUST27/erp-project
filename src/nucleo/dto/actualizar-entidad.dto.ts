import { PartialType } from '@nestjs/mapped-types';
import { CrearEntidadDto } from './crear-entidad.dto';

export class ActualizarEntidadDto extends PartialType(CrearEntidadDto) {}

