import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearUsuarioDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsUUID()
  @IsOptional()
  entidad_id?: string;

  @IsBoolean()
  @IsOptional()
  esta_activo?: boolean;
}

