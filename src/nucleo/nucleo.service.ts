import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { Entidad } from './entities/entidad.entity';
import { RolEntidad } from './entities/rol-entidad.entity';
import { Usuario } from './entities/usuario.entity';
import { RolUsuario } from './entities/rol-usuario.entity';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { FiltrosProductoDto } from './dto/filtros-producto.dto';
import { CrearEntidadDto } from './dto/crear-entidad.dto';
import { ActualizarEntidadDto } from './dto/actualizar-entidad.dto';
import { FiltrosEntidadDto } from './dto/filtros-entidad.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { PaginacionResult } from '../common/dtos/paginacion.dto';
import { AuthService } from '../auth/auth.service';
import { TipoRol, TipoRolUsuario } from '../common/enums';

@Injectable()
export class NucleoService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(Entidad)
    private entidadRepository: Repository<Entidad>,
    @InjectRepository(RolEntidad)
    private rolEntidadRepository: Repository<RolEntidad>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(RolUsuario)
    private rolUsuarioRepository: Repository<RolUsuario>,
    private authService: AuthService,
  ) {}

  // ========== PRODUCTOS ==========

  async crearProducto(crearProductoDto: CrearProductoDto): Promise<Producto> {
    // Verificar si el SKU ya existe
    const existe = await this.productoRepository.findOne({
      where: { sku: crearProductoDto.sku },
    });

    if (existe) {
      throw new ConflictException(`El SKU ${crearProductoDto.sku} ya existe`);
    }

    const producto = this.productoRepository.create({
      ...crearProductoDto,
      precio_venta_defecto: crearProductoDto.precio_venta_defecto ?? 0,
      precio_costo_defecto: crearProductoDto.precio_costo_defecto ?? 0,
      esta_activo: crearProductoDto.esta_activo ?? true,
    });

    return this.productoRepository.save(producto);
  }

  async listarProductos(
    filtros: FiltrosProductoDto,
  ): Promise<PaginacionResult<Producto>> {
    const { page = 1, limit = 10, busqueda, tipo_producto, esta_activo } =
      filtros;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productoRepository.createQueryBuilder('producto');

    if (busqueda) {
      queryBuilder.where(
        '(producto.nombre ILIKE :busqueda OR producto.sku ILIKE :busqueda OR producto.descripcion ILIKE :busqueda)',
        { busqueda: `%${busqueda}%` },
      );
    }

    if (tipo_producto) {
      queryBuilder.andWhere('producto.tipo_producto = :tipo_producto', {
        tipo_producto,
      });
    }

    if (esta_activo !== undefined) {
      queryBuilder.andWhere('producto.esta_activo = :esta_activo', {
        esta_activo,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('producto.fecha_creacion', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async obtenerProducto(productoId: string): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { producto_id: productoId },
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${productoId} no encontrado`,
      );
    }

    return producto;
  }

  async actualizarProducto(
    productoId: string,
    actualizarProductoDto: ActualizarProductoDto,
  ): Promise<Producto> {
    const producto = await this.obtenerProducto(productoId);

    // Si se actualiza el SKU, verificar que no exista otro con el mismo SKU
    if (
      actualizarProductoDto.sku &&
      actualizarProductoDto.sku !== producto.sku
    ) {
      const existe = await this.productoRepository.findOne({
        where: { sku: actualizarProductoDto.sku },
      });

      if (existe) {
        throw new ConflictException(
          `El SKU ${actualizarProductoDto.sku} ya existe`,
        );
      }
    }

    Object.assign(producto, actualizarProductoDto);
    return this.productoRepository.save(producto);
  }

  async eliminarProducto(productoId: string): Promise<void> {
    const producto = await this.obtenerProducto(productoId);

    // Borrado lógico
    producto.esta_activo = false;
    await this.productoRepository.save(producto);
  }

  // ========== ENTIDADES ==========

  async crearEntidad(crearEntidadDto: CrearEntidadDto): Promise<Entidad> {
    // Verificar si el email ya existe (si se proporciona)
    if (crearEntidadDto.email) {
      const existe = await this.entidadRepository.findOne({
        where: { email: crearEntidadDto.email },
      });

      if (existe) {
        throw new ConflictException(
          `El email ${crearEntidadDto.email} ya está registrado`,
        );
      }
    }

    const entidad = this.entidadRepository.create(crearEntidadDto);
    return this.entidadRepository.save(entidad);
  }

  async listarEntidades(
    filtros: FiltrosEntidadDto,
  ): Promise<PaginacionResult<Entidad>> {
    const { page = 1, limit = 10, busqueda, tipo_entidad, tipo_rol } = filtros;
    const skip = (page - 1) * limit;

    const queryBuilder = this.entidadRepository
      .createQueryBuilder('entidad')
      .leftJoinAndSelect('entidad.roles', 'roles');

    if (busqueda) {
      queryBuilder.where(
        '(entidad.nombre_mostrado ILIKE :busqueda OR entidad.email ILIKE :busqueda)',
        { busqueda: `%${busqueda}%` },
      );
    }

    if (tipo_entidad) {
      queryBuilder.andWhere('entidad.tipo_entidad = :tipo_entidad', {
        tipo_entidad,
      });
    }

    if (tipo_rol) {
      queryBuilder.andWhere('roles.tipo_rol = :tipo_rol', { tipo_rol });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('entidad.fecha_creacion', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async obtenerEntidad(entidadId: string): Promise<Entidad> {
    const entidad = await this.entidadRepository.findOne({
      where: { entidad_id: entidadId },
      relations: ['roles', 'direcciones'],
    });

    if (!entidad) {
      throw new NotFoundException(
        `Entidad con ID ${entidadId} no encontrada`,
      );
    }

    return entidad;
  }

  async actualizarEntidad(
    entidadId: string,
    actualizarEntidadDto: ActualizarEntidadDto,
  ): Promise<Entidad> {
    const entidad = await this.obtenerEntidad(entidadId);

    // Si se actualiza el email, verificar que no exista otro con el mismo email
    if (
      actualizarEntidadDto.email &&
      actualizarEntidadDto.email !== entidad.email
    ) {
      const existe = await this.entidadRepository.findOne({
        where: { email: actualizarEntidadDto.email },
      });

      if (existe) {
        throw new ConflictException(
          `El email ${actualizarEntidadDto.email} ya está registrado`,
        );
      }
    }

    Object.assign(entidad, actualizarEntidadDto);
    return this.entidadRepository.save(entidad);
  }

  // ========== ROLES DE ENTIDAD ==========

  async asignarRolEntidad(
    entidadId: string,
    tipoRol: TipoRol,
  ): Promise<RolEntidad> {
    const entidad = await this.obtenerEntidad(entidadId);

    // Verificar si el rol ya existe
    const rolExistente = await this.rolEntidadRepository.findOne({
      where: { entidad_id: entidadId, tipo_rol: tipoRol },
    });

    if (rolExistente) {
      throw new ConflictException(
        `La entidad ya tiene el rol ${tipoRol} asignado`,
      );
    }

    const rol = this.rolEntidadRepository.create({
      entidad_id: entidadId,
      tipo_rol: tipoRol,
    });

    return this.rolEntidadRepository.save(rol);
  }

  async removerRolEntidad(entidadId: string, tipoRol: TipoRol): Promise<void> {
    const rol = await this.rolEntidadRepository.findOne({
      where: { entidad_id: entidadId, tipo_rol: tipoRol },
    });

    if (!rol) {
      throw new NotFoundException(
        `La entidad no tiene el rol ${tipoRol} asignado`,
      );
    }

    await this.rolEntidadRepository.remove(rol);
  }

  // ========== USUARIOS ==========

  async crearUsuario(crearUsuarioDto: CrearUsuarioDto): Promise<Usuario> {
    // Verificar si el email ya existe
    const existe = await this.usuarioRepository.findOne({
      where: { email: crearUsuarioDto.email },
    });

    if (existe) {
      throw new ConflictException(
        `El email ${crearUsuarioDto.email} ya está registrado`,
      );
    }

    // Verificar que la entidad existe (si se proporciona)
    if (crearUsuarioDto.entidad_id) {
      const entidad = await this.entidadRepository.findOne({
        where: { entidad_id: crearUsuarioDto.entidad_id },
      });

      if (!entidad) {
        throw new NotFoundException(
          `Entidad con ID ${crearUsuarioDto.entidad_id} no encontrada`,
        );
      }
    }

    // Hash de la contraseña
    const hash_contrasena = await this.authService.hashPassword(
      crearUsuarioDto.password,
    );

    const usuario = this.usuarioRepository.create({
      email: crearUsuarioDto.email,
      hash_contrasena,
      entidad_id: crearUsuarioDto.entidad_id,
      esta_activo: crearUsuarioDto.esta_activo ?? true,
    });

    return this.usuarioRepository.save(usuario);
  }

  async listarUsuarios(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      relations: ['entidad', 'roles'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  // ========== ROLES DE USUARIO ==========

  async asignarRolUsuario(
    usuarioId: string,
    tipoRol: TipoRolUsuario,
  ): Promise<RolUsuario> {
    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findOne({
      where: { usuario_id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${usuarioId} no encontrado`,
      );
    }

    // Verificar si el rol ya existe
    const rolExistente = await this.rolUsuarioRepository.findOne({
      where: { usuario_id: usuarioId, tipo_rol: tipoRol },
    });

    if (rolExistente) {
      throw new ConflictException(
        `El usuario ya tiene el rol ${tipoRol} asignado`,
      );
    }

    const rol = this.rolUsuarioRepository.create({
      usuario_id: usuarioId,
      tipo_rol: tipoRol,
    });

    return this.rolUsuarioRepository.save(rol);
  }

  async removerRolUsuario(
    usuarioId: string,
    tipoRol: TipoRolUsuario,
  ): Promise<void> {
    const rol = await this.rolUsuarioRepository.findOne({
      where: { usuario_id: usuarioId, tipo_rol: tipoRol },
    });

    if (!rol) {
      throw new NotFoundException(
        `El usuario no tiene el rol ${tipoRol} asignado`,
      );
    }

    await this.rolUsuarioRepository.remove(rol);
  }

  async obtenerRolesUsuario(usuarioId: string): Promise<RolUsuario[]> {
    return this.rolUsuarioRepository.find({
      where: { usuario_id: usuarioId },
      order: { fecha_asignacion: 'DESC' },
    });
  }
}

