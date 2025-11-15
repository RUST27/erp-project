import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../nucleo/entities/usuario.entity';
import { Entidad } from '../nucleo/entities/entidad.entity';
import { TipoEntidad } from '../common/enums';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Entidad)
    private entidadRepository: Repository<Entidad>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Buscar usuario por email
    // Primero intentamos sin relaciones para evitar errores si las tablas no existen
    let usuario = await this.usuarioRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Verificar si el usuario está activo
    if (!usuario.esta_activo) {
      throw new UnauthorizedException('Usuario inactivo. Contacta al administrador.');
    }

    // Verificar contraseña
    if (!usuario.hash_contrasena) {
      throw new UnauthorizedException('Error en la configuración del usuario');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      usuario.hash_contrasena,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Cargar relaciones de forma segura
    // Si el usuario existe, intentamos cargar sus relaciones
    if (usuario) {
      try {
        const usuarioConRelaciones = await this.usuarioRepository.findOne({
          where: { email: loginDto.email },
          relations: ['entidad', 'roles'],
        });
        if (usuarioConRelaciones) {
          usuario = usuarioConRelaciones;
        }
      } catch (error) {
        // Si falla, intentamos solo con entidad
        try {
          const usuarioConEntidad = await this.usuarioRepository.findOne({
            where: { email: loginDto.email },
            relations: ['entidad'],
          });
          if (usuarioConEntidad) {
            usuario = usuarioConEntidad;
          }
        } catch (error2) {
          // Si también falla, usamos el usuario sin relaciones
          // Ya lo tenemos cargado arriba
        }
      }
    }

    // Asegurar que usuario no es null (ya lo validamos arriba)
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Obtener roles de forma segura
    let roles: string[] = [];
    if (usuario.roles && Array.isArray(usuario.roles)) {
      roles = usuario.roles.map((rol) => rol.tipo_rol);
    }

    // Generar token JWT con todos los datos del usuario
    const payload = {
      sub: usuario.usuario_id,
      email: usuario.email,
      esta_activo: usuario.esta_activo,
      entidad_id: usuario.entidad_id || undefined,
      roles: roles,
      entidad: usuario.entidad
        ? {
            entidad_id: usuario.entidad.entidad_id,
            tipo_entidad: usuario.entidad.tipo_entidad,
            nombre_mostrado: usuario.entidad.nombre_mostrado,
            email: usuario.entidad.email || undefined,
            telefono: usuario.entidad.telefono || undefined,
          }
        : undefined,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      usuario: {
        usuario_id: usuario.usuario_id,
        email: usuario.email,
        entidad_id: usuario.entidad_id || undefined,
        nombre_mostrado: usuario.entidad?.nombre_mostrado,
      },
    };
  }

  async validateUser(usuarioId: string): Promise<Usuario | null> {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuario_id: usuarioId },
      relations: ['entidad'],
    });

    if (!usuario || !usuario.esta_activo) {
      return null;
    }

    return usuario;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Verificar si el email ya existe en usuarios
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: { email: registerDto.email },
    });

    if (usuarioExistente) {
      throw new ConflictException(
        `El email ${registerDto.email} ya está registrado`,
      );
    }

    // Verificar si el email ya existe en entidades
    const entidadExistente = await this.entidadRepository.findOne({
      where: { email: registerDto.email },
    });

    if (entidadExistente) {
      throw new ConflictException(
        `El email ${registerDto.email} ya está registrado`,
      );
    }

    // Crear entidad de tipo PERSONA
    const entidad = this.entidadRepository.create({
      tipo_entidad: TipoEntidad.PERSONA,
      nombre_mostrado: registerDto.nombre_mostrado,
      email: registerDto.email,
      telefono: registerDto.telefono,
    });

    const entidadGuardada = await this.entidadRepository.save(entidad);

    // Hash de la contraseña
    const hash_contrasena = await this.hashPassword(registerDto.password);

    // Crear usuario vinculado a la entidad
    const usuario = this.usuarioRepository.create({
      email: registerDto.email,
      hash_contrasena,
      entidad_id: entidadGuardada.entidad_id,
      esta_activo: true,
    });

    const usuarioGuardado = await this.usuarioRepository.save(usuario);

    // Obtener la entidad completa para incluirla en el token
    const entidadCompleta = await this.entidadRepository.findOne({
      where: { entidad_id: entidadGuardada.entidad_id },
    });

    // Generar token JWT con todos los datos del usuario
    // Al registrar, el usuario no tiene roles aún, así que será un array vacío
    const payload = {
      sub: usuarioGuardado.usuario_id,
      email: usuarioGuardado.email,
      esta_activo: usuarioGuardado.esta_activo,
      entidad_id: usuarioGuardado.entidad_id || undefined,
      roles: [], // Usuario nuevo sin roles asignados
      entidad: entidadCompleta
        ? {
            entidad_id: entidadCompleta.entidad_id,
            tipo_entidad: entidadCompleta.tipo_entidad,
            nombre_mostrado: entidadCompleta.nombre_mostrado,
            email: entidadCompleta.email || undefined,
            telefono: entidadCompleta.telefono || undefined,
          }
        : undefined,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      usuario: {
        usuario_id: usuarioGuardado.usuario_id,
        email: usuarioGuardado.email,
        entidad_id: usuarioGuardado.entidad_id,
        nombre_mostrado: entidadGuardada.nombre_mostrado,
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}

