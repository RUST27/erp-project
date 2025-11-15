import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

export interface JwtPayload {
  sub: string; // usuario_id
  email: string;
  esta_activo: boolean;
  entidad_id?: string;
  roles: string[]; // Array de roles del usuario (ADMIN, VENTAS, etc.)
  entidad?: {
    entidad_id: string;
    tipo_entidad: string;
    nombre_mostrado: string;
    email?: string;
    telefono?: string;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado en las variables de entorno');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    // Verificar que el usuario sigue activo (validación mínima)
    // Los datos completos vienen del token
    if (!payload.esta_activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Retornar los datos del token directamente
    // Opcionalmente, puedes hacer una validación adicional consultando la BD
    // pero para mejor rendimiento, usamos los datos del token
    return {
      usuario_id: payload.sub,
      email: payload.email,
      esta_activo: payload.esta_activo,
      entidad_id: payload.entidad_id,
      roles: payload.roles || [],
      entidad: payload.entidad,
    };
  }
}

