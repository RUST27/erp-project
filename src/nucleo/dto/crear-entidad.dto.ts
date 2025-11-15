import { IsString, IsNotEmpty, IsEnum, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoEntidad } from '../../common/enums';

export class CrearEntidadDto {
  @ApiProperty({
    description: 'Tipo de entidad',
    enum: TipoEntidad,
    example: TipoEntidad.PERSONA,
  })
  @IsEnum(TipoEntidad, { message: 'Tipo de entidad inválido' })
  tipo_entidad: TipoEntidad;

  @ApiProperty({
    description: 'Nombre completo o razón social',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre_mostrado: string;

  @ApiProperty({
    description: 'Email de contacto (debe ser único si se proporciona)',
    example: 'juan@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Número de teléfono',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  telefono?: string;
}

