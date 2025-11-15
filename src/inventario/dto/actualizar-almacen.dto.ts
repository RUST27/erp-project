import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class ActualizarAlmacenDto {
  @ApiProperty({
    description: 'Nombre del almacén',
    example: 'Almacén Principal Actualizado',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @ApiProperty({
    description: 'ID de la dirección del almacén',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  direccion_id?: string;
}

