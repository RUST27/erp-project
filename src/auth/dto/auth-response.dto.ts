import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT para autenticación',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Datos del usuario autenticado',
    example: {
      usuario_id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'usuario@example.com',
      entidad_id: '123e4567-e89b-12d3-a456-426614174001',
      nombre_mostrado: 'Juan Pérez',
    },
  })
  usuario: {
    usuario_id: string;
    email: string;
    entidad_id?: string;
    nombre_mostrado?: string;
  };
}

