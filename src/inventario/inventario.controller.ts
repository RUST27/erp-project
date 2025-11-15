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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { InventarioService } from './inventario.service';
import { CrearAlmacenDto } from './dto/crear-almacen.dto';
import { ActualizarAlmacenDto } from './dto/actualizar-almacen.dto';
import { CrearTransferenciaDto } from './dto/crear-transferencia.dto';
import { AjusteInventarioDto } from './dto/ajuste-inventario.dto';
import { ValidarStockDto } from './dto/validar-stock.dto';
import { FiltrosStockDto } from './dto/filtros-stock.dto';
import { FiltrosMovimientosDto } from './dto/filtros-movimientos.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Almacen } from './entities/almacen.entity';
import { Movimiento } from './entities/movimiento.entity';
import { NivelStock } from './entities/nivel-stock.entity';
import { PaginacionResult } from '../common/dtos/paginacion.dto';

@ApiTags('inventario')
@ApiBearerAuth('JWT-auth')
@Controller('inventario')
@UseGuards(JwtAuthGuard) // Todos los endpoints protegidos
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  // ========== ALMACENES ==========

  @Post('almacenes')
  @ApiOperation({
    summary: 'Crear almacén',
    description: 'Crea un nuevo almacén en el sistema. La dirección es opcional.',
  })
  @ApiResponse({
    status: 201,
    description: 'Almacén creado exitosamente',
    type: Almacen,
  })
  @ApiResponse({
    status: 404,
    description: 'La dirección especificada no existe',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async crearAlmacen(@Body() crearAlmacenDto: CrearAlmacenDto): Promise<Almacen> {
    return this.inventarioService.crearAlmacen(crearAlmacenDto);
  }

  @Get('almacenes')
  @ApiOperation({
    summary: 'Listar almacenes',
    description: 'Obtiene una lista de todos los almacenes con sus direcciones.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de almacenes',
    type: [Almacen],
  })
  async listarAlmacenes(): Promise<Almacen[]> {
    return this.inventarioService.listarAlmacenes();
  }

  @Get('almacenes/:id')
  @ApiOperation({
    summary: 'Obtener almacén por ID',
    description: 'Obtiene los detalles de un almacén específico.',
  })
  @ApiParam({ name: 'id', description: 'UUID del almacén' })
  @ApiResponse({
    status: 200,
    description: 'Almacén encontrado',
    type: Almacen,
  })
  @ApiResponse({ status: 404, description: 'Almacén no encontrado' })
  async obtenerAlmacen(@Param('id') id: string): Promise<Almacen> {
    return this.inventarioService.obtenerAlmacen(id);
  }

  @Patch('almacenes/:id')
  @ApiOperation({
    summary: 'Actualizar almacén',
    description: 'Actualiza parcialmente un almacén existente.',
  })
  @ApiParam({ name: 'id', description: 'UUID del almacén' })
  @ApiResponse({
    status: 200,
    description: 'Almacén actualizado',
    type: Almacen,
  })
  @ApiResponse({ status: 404, description: 'Almacén o dirección no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async actualizarAlmacen(
    @Param('id') id: string,
    @Body() actualizarAlmacenDto: ActualizarAlmacenDto,
  ): Promise<Almacen> {
    return this.inventarioService.actualizarAlmacen(id, actualizarAlmacenDto);
  }

  @Delete('almacenes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar almacén',
    description:
      'Elimina un almacén. Solo se puede eliminar si no tiene movimientos ni stock asociado.',
  })
  @ApiParam({ name: 'id', description: 'UUID del almacén' })
  @ApiResponse({ status: 204, description: 'Almacén eliminado' })
  @ApiResponse({ status: 404, description: 'Almacén no encontrado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar porque tiene movimientos o stock asociado',
  })
  async eliminarAlmacen(@Param('id') id: string): Promise<void> {
    await this.inventarioService.eliminarAlmacen(id);
  }

  // ========== STOCK ==========

  @Get('stock/niveles')
  @ApiOperation({
    summary: 'Consultar niveles de stock',
    description:
      'Obtiene los niveles de stock actuales con filtros opcionales por producto y/o almacén. Incluye paginación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Niveles de stock',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/NivelStock' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async obtenerNivelesStock(
    @Query() filtros: FiltrosStockDto,
  ): Promise<PaginacionResult<NivelStock>> {
    return this.inventarioService.obtenerNivelesStock(filtros);
  }

  // ========== MOVIMIENTOS ==========

  @Get('stock/movimientos')
  @ApiOperation({
    summary: 'Consultar movimientos de inventario',
    description:
      'Obtiene el historial de movimientos de inventario con filtros avanzados (producto, almacén, fechas, tipo de documento). Incluye paginación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Movimientos de inventario',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Movimiento' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async obtenerMovimientos(
    @Query() filtros: FiltrosMovimientosDto,
  ): Promise<PaginacionResult<Movimiento>> {
    return this.inventarioService.obtenerMovimientos(filtros);
  }

  @Get('stock/movimientos/:id')
  @ApiOperation({
    summary: 'Obtener movimiento por ID',
    description: 'Obtiene los detalles de un movimiento específico.',
  })
  @ApiParam({ name: 'id', description: 'UUID del movimiento' })
  @ApiResponse({
    status: 200,
    description: 'Movimiento encontrado',
    type: Movimiento,
  })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  async obtenerMovimiento(@Param('id') id: string): Promise<Movimiento> {
    return this.inventarioService.obtenerMovimiento(id);
  }

  // ========== TRANSFERENCIAS ==========

  @Post('transferencias')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Transferir stock entre almacenes',
    description:
      'Transfiere stock de un almacén a otro. Crea automáticamente dos movimientos (salida y entrada) y actualiza los niveles de stock.',
  })
  @ApiResponse({
    status: 201,
    description: 'Transferencia realizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        movimiento_salida: { $ref: '#/components/schemas/Movimiento' },
        movimiento_entrada: { $ref: '#/components/schemas/Movimiento' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o stock insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto o almacén no encontrado',
  })
  async crearTransferencia(
    @Body() crearTransferenciaDto: CrearTransferenciaDto,
  ): Promise<{ movimiento_salida: Movimiento; movimiento_entrada: Movimiento }> {
    return this.inventarioService.crearTransferencia(crearTransferenciaDto);
  }

  // ========== AJUSTES DE INVENTARIO ==========

  @Post('ajustes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear ajuste de inventario',
    description:
      'Crea un ajuste manual de inventario (entrada o salida). Útil para correcciones por inventario físico, pérdidas, etc.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ajuste creado exitosamente',
    type: Movimiento,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos, producto no almacenable o stock insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto o almacén no encontrado',
  })
  async crearAjusteInventario(
    @Body() ajusteInventarioDto: AjusteInventarioDto,
  ): Promise<Movimiento> {
    return this.inventarioService.crearAjusteInventario(ajusteInventarioDto);
  }

  // ========== CONSULTAS AVANZADAS ==========

  @Get('productos/:productoId/stock-consolidado')
  @ApiOperation({
    summary: 'Obtener stock consolidado de un producto',
    description:
      'Obtiene el stock de un producto en todos los almacenes y el total consolidado.',
  })
  @ApiParam({ name: 'productoId', description: 'UUID del producto' })
  @ApiResponse({
    status: 200,
    description: 'Stock consolidado del producto',
    schema: {
      type: 'object',
      properties: {
        producto: { $ref: '#/components/schemas/Producto' },
        stock_por_almacen: {
          type: 'array',
          items: { $ref: '#/components/schemas/NivelStock' },
        },
        stock_total: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async obtenerStockConsolidadoProducto(@Param('productoId') productoId: string) {
    return this.inventarioService.obtenerStockConsolidadoProducto(productoId);
  }

  @Get('almacenes/:id/stock')
  @ApiOperation({
    summary: 'Obtener stock de un almacén',
    description:
      'Obtiene todos los productos con stock en un almacén específico. Incluye opción para filtrar solo productos con stock > 0.',
  })
  @ApiParam({ name: 'id', description: 'UUID del almacén' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos con stock en el almacén',
    type: [NivelStock],
  })
  @ApiResponse({ status: 404, description: 'Almacén no encontrado' })
  async obtenerStockPorAlmacen(
    @Param('id') id: string,
    @Query('solo_con_stock') soloConStock?: string,
  ) {
    const filtros = {
      solo_con_stock: soloConStock === 'true',
    };
    return this.inventarioService.obtenerStockPorAlmacen(id, filtros);
  }

  @Post('validar-stock')
  @ApiOperation({
    summary: 'Validar disponibilidad de stock',
    description:
      'Valida si hay stock suficiente de un producto en un almacén específico o en todos los almacenes. Útil antes de crear pedidos de venta.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la validación',
    schema: {
      type: 'object',
      properties: {
        disponible: { type: 'boolean' },
        stock_disponible: { type: 'number' },
        almacen_id: { type: 'string', nullable: true },
        almacen_nombre: { type: 'string', nullable: true },
        mensaje: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async validarDisponibilidadStock(@Body() validarStockDto: ValidarStockDto) {
    return this.inventarioService.validarDisponibilidadStock(validarStockDto);
  }

  @Get('productos/:productoId/historial')
  @ApiOperation({
    summary: 'Obtener historial de movimientos de un producto',
    description:
      'Obtiene el historial completo de movimientos de un producto específico, ordenado por fecha más reciente.',
  })
  @ApiParam({ name: 'productoId', description: 'UUID del producto' })
  @ApiResponse({
    status: 200,
    description: 'Historial de movimientos',
    type: [Movimiento],
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async obtenerHistorialProducto(
    @Param('productoId') productoId: string,
    @Query('limite') limite?: string,
  ) {
    const limiteNum = limite ? parseInt(limite, 10) : 50;
    return this.inventarioService.obtenerHistorialProducto(productoId, limiteNum);
  }
}

