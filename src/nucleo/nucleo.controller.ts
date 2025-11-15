import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NucleoService } from './nucleo.service';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { FiltrosProductoDto } from './dto/filtros-producto.dto';
import { CrearEntidadDto } from './dto/crear-entidad.dto';
import { ActualizarEntidadDto } from './dto/actualizar-entidad.dto';
import { FiltrosEntidadDto } from './dto/filtros-entidad.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TipoRol, TipoRolUsuario } from '../common/enums';

@ApiTags('nucleo')
@ApiBearerAuth('JWT-auth')
@Controller('nucleo')
@UseGuards(JwtAuthGuard) // Todos los endpoints protegidos
export class NucleoController {
  constructor(private readonly nucleoService: NucleoService) {}

  // ========== PRODUCTOS ==========

  @Post('productos')
  @ApiOperation({
    summary: 'Crear producto',
    description: 'Crea un nuevo producto en el catálogo. El SKU debe ser único.',
  })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El SKU ya existe' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async crearProducto(@Body() crearProductoDto: CrearProductoDto) {
    return this.nucleoService.crearProducto(crearProductoDto);
  }

  @Get('productos')
  @ApiOperation({
    summary: 'Listar productos',
    description: 'Obtiene una lista paginada de productos con filtros opcionales.',
  })
  @ApiResponse({ status: 200, description: 'Lista de productos' })
  async listarProductos(@Query() filtros: FiltrosProductoDto) {
    return this.nucleoService.listarProductos(filtros);
  }

  @Get('productos/:id')
  @ApiOperation({
    summary: 'Obtener producto por ID',
    description: 'Obtiene los detalles de un producto específico.',
  })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async obtenerProducto(@Param('id') id: string) {
    return this.nucleoService.obtenerProducto(id);
  }

  @Patch('productos/:id')
  @ApiOperation({
    summary: 'Actualizar producto',
    description: 'Actualiza parcialmente un producto existente.',
  })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 409, description: 'El nuevo SKU ya existe' })
  async actualizarProducto(
    @Param('id') id: string,
    @Body() actualizarProductoDto: ActualizarProductoDto,
  ) {
    return this.nucleoService.actualizarProducto(id, actualizarProductoDto);
  }

  @Delete('productos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar producto',
    description: 'Realiza un borrado lógico del producto (marca como inactivo).',
  })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 204, description: 'Producto eliminado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async eliminarProducto(@Param('id') id: string) {
    await this.nucleoService.eliminarProducto(id);
  }

  // ========== ENTIDADES ==========

  @Post('entidades')
  @ApiOperation({
    summary: 'Crear entidad',
    description: 'Crea una nueva entidad (persona u organización). El email debe ser único.',
  })
  @ApiResponse({ status: 201, description: 'Entidad creada exitosamente' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async crearEntidad(@Body() crearEntidadDto: CrearEntidadDto) {
    return this.nucleoService.crearEntidad(crearEntidadDto);
  }

  @Get('entidades')
  @ApiOperation({
    summary: 'Listar entidades',
    description: 'Obtiene una lista paginada de entidades con filtros opcionales (tipo, rol, búsqueda).',
  })
  @ApiResponse({ status: 200, description: 'Lista de entidades' })
  async listarEntidades(@Query() filtros: FiltrosEntidadDto) {
    return this.nucleoService.listarEntidades(filtros);
  }

  @Get('entidades/:id')
  @ApiOperation({
    summary: 'Obtener entidad por ID',
    description: 'Obtiene los detalles de una entidad específica incluyendo sus roles y direcciones.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la entidad' })
  @ApiResponse({ status: 200, description: 'Entidad encontrada' })
  @ApiResponse({ status: 404, description: 'Entidad no encontrada' })
  async obtenerEntidad(@Param('id') id: string) {
    return this.nucleoService.obtenerEntidad(id);
  }

  @Patch('entidades/:id')
  @ApiOperation({
    summary: 'Actualizar entidad',
    description: 'Actualiza parcialmente una entidad existente.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la entidad' })
  @ApiResponse({ status: 200, description: 'Entidad actualizada' })
  @ApiResponse({ status: 404, description: 'Entidad no encontrada' })
  @ApiResponse({ status: 409, description: 'El nuevo email ya está registrado' })
  async actualizarEntidad(
    @Param('id') id: string,
    @Body() actualizarEntidadDto: ActualizarEntidadDto,
  ) {
    return this.nucleoService.actualizarEntidad(id, actualizarEntidadDto);
  }

  // ========== ROLES DE ENTIDAD ==========

  @Post('entidades/:id/roles/:tipoRol')
  @ApiOperation({
    summary: 'Asignar rol a entidad',
    description: 'Asigna un rol (CLIENTE, PROVEEDOR, EMPLEADO) a una entidad.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la entidad' })
  @ApiParam({
    name: 'tipoRol',
    description: 'Tipo de rol',
    enum: TipoRol,
    example: 'CLIENTE',
  })
  @ApiResponse({ status: 201, description: 'Rol asignado exitosamente' })
  @ApiResponse({ status: 404, description: 'Entidad no encontrada' })
  @ApiResponse({ status: 409, description: 'La entidad ya tiene este rol asignado' })
  @ApiResponse({ status: 400, description: 'Tipo de rol inválido' })
  async asignarRolEntidad(
    @Param('id') id: string,
    @Param('tipoRol') tipoRol: string,
  ) {
    // Validar que el tipoRol sea un valor válido del enum
    if (!Object.values(TipoRol).includes(tipoRol as TipoRol)) {
      throw new BadRequestException(
        `Tipo de rol inválido. Valores permitidos: ${Object.values(TipoRol).join(', ')}`,
      );
    }
    return this.nucleoService.asignarRolEntidad(id, tipoRol as TipoRol);
  }

  @Delete('entidades/:id/roles/:tipoRol')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover rol de entidad',
    description: 'Remueve un rol asignado a una entidad.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la entidad' })
  @ApiParam({
    name: 'tipoRol',
    description: 'Tipo de rol a remover',
    enum: TipoRol,
    example: 'CLIENTE',
  })
  @ApiResponse({ status: 204, description: 'Rol removido exitosamente' })
  @ApiResponse({ status: 404, description: 'Entidad o rol no encontrado' })
  @ApiResponse({ status: 400, description: 'Tipo de rol inválido' })
  async removerRolEntidad(
    @Param('id') id: string,
    @Param('tipoRol') tipoRol: string,
  ) {
    // Validar que el tipoRol sea un valor válido del enum
    if (!Object.values(TipoRol).includes(tipoRol as TipoRol)) {
      throw new BadRequestException(
        `Tipo de rol inválido. Valores permitidos: ${Object.values(TipoRol).join(', ')}`,
      );
    }
    await this.nucleoService.removerRolEntidad(id, tipoRol as TipoRol);
  }

  // ========== USUARIOS ==========

  @Post('usuarios')
  @ApiOperation({
    summary: 'Crear usuario del sistema',
    description: 'Crea un nuevo usuario del sistema. La contraseña se hashea automáticamente.',
  })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({ status: 404, description: 'Entidad no encontrada (si se proporciona entidad_id)' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async crearUsuario(@Body() crearUsuarioDto: CrearUsuarioDto) {
    return this.nucleoService.crearUsuario(crearUsuarioDto);
  }

  @Get('usuarios')
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Obtiene una lista de todos los usuarios del sistema con sus entidades y roles asociados.',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  async listarUsuarios() {
    return this.nucleoService.listarUsuarios();
  }

  // ========== ROLES DE USUARIO ==========

  @Post('usuarios/:id/roles/:tipoRol')
  @ApiOperation({
    summary: 'Asignar rol a usuario',
    description: 'Asigna un rol del sistema (ADMIN, VENTAS, COMPRAS, INVENTARIO, CONTABILIDAD, USUARIO) a un usuario.',
  })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiParam({
    name: 'tipoRol',
    description: 'Tipo de rol del sistema',
    enum: TipoRolUsuario,
    example: 'ADMIN',
  })
  @ApiResponse({ status: 201, description: 'Rol asignado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene este rol asignado' })
  @ApiResponse({ status: 400, description: 'Tipo de rol inválido' })
  async asignarRolUsuario(
    @Param('id') id: string,
    @Param('tipoRol') tipoRol: string,
  ) {
    // Validar que el tipoRol sea un valor válido del enum
    if (!Object.values(TipoRolUsuario).includes(tipoRol as TipoRolUsuario)) {
      throw new BadRequestException(
        `Tipo de rol inválido. Valores permitidos: ${Object.values(TipoRolUsuario).join(', ')}`,
      );
    }
    return this.nucleoService.asignarRolUsuario(id, tipoRol as TipoRolUsuario);
  }

  @Delete('usuarios/:id/roles/:tipoRol')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover rol de usuario',
    description: 'Remueve un rol del sistema asignado a un usuario.',
  })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiParam({
    name: 'tipoRol',
    description: 'Tipo de rol a remover',
    enum: TipoRolUsuario,
    example: 'ADMIN',
  })
  @ApiResponse({ status: 204, description: 'Rol removido exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
  @ApiResponse({ status: 400, description: 'Tipo de rol inválido' })
  async removerRolUsuario(
    @Param('id') id: string,
    @Param('tipoRol') tipoRol: string,
  ) {
    // Validar que el tipoRol sea un valor válido del enum
    if (!Object.values(TipoRolUsuario).includes(tipoRol as TipoRolUsuario)) {
      throw new BadRequestException(
        `Tipo de rol inválido. Valores permitidos: ${Object.values(TipoRolUsuario).join(', ')}`,
      );
    }
    await this.nucleoService.removerRolUsuario(id, tipoRol as TipoRolUsuario);
  }

  @Get('usuarios/:id/roles')
  @ApiOperation({
    summary: 'Obtener roles de usuario',
    description: 'Obtiene todos los roles del sistema asignados a un usuario.',
  })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de roles del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async obtenerRolesUsuario(@Param('id') id: string) {
    return this.nucleoService.obtenerRolesUsuario(id);
  }
}

