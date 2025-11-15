import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Almacen } from './entities/almacen.entity';
import { Movimiento } from './entities/movimiento.entity';
import { NivelStock } from './entities/nivel-stock.entity';
import { Producto } from '../nucleo/entities/producto.entity';
import { CrearAlmacenDto } from './dto/crear-almacen.dto';
import { ActualizarAlmacenDto } from './dto/actualizar-almacen.dto';
import { CrearTransferenciaDto } from './dto/crear-transferencia.dto';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto';
import { AjusteInventarioDto, TipoAjuste } from './dto/ajuste-inventario.dto';
import { ValidarStockDto } from './dto/validar-stock.dto';
import { FiltrosStockDto } from './dto/filtros-stock.dto';
import { FiltrosMovimientosDto } from './dto/filtros-movimientos.dto';
import { PaginacionResult } from '../common/dtos/paginacion.dto';
import { TipoDocumentoOrigen } from '../common/enums';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Almacen)
    private almacenRepository: Repository<Almacen>,
    @InjectRepository(Movimiento)
    private movimientoRepository: Repository<Movimiento>,
    @InjectRepository(NivelStock)
    private nivelStockRepository: Repository<NivelStock>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    private dataSource: DataSource,
  ) {}

  // ========== ALMACENES ==========

  async crearAlmacen(crearAlmacenDto: CrearAlmacenDto): Promise<Almacen> {
    try {
      const almacen = this.almacenRepository.create(crearAlmacenDto);
      return await this.almacenRepository.save(almacen);
    } catch (error) {
      if (error.code === '23503') {
        // Foreign key violation
        throw new NotFoundException('La dirección especificada no existe');
      }
      throw new InternalServerErrorException(
        'Error al crear el almacén',
        error.message,
      );
    }
  }

  async listarAlmacenes(): Promise<Almacen[]> {
    try {
      return await this.almacenRepository.find({
        relations: ['direccion'],
        order: { fecha_creacion: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al listar los almacenes',
        error.message,
      );
    }
  }

  async obtenerAlmacen(id: string): Promise<Almacen> {
    try {
      const almacen = await this.almacenRepository.findOne({
        where: { almacen_id: id },
        relations: ['direccion'],
      });

      if (!almacen) {
        throw new NotFoundException(`Almacén con ID ${id} no encontrado`);
      }

      return almacen;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener el almacén',
        error.message,
      );
    }
  }

  async actualizarAlmacen(
    id: string,
    actualizarAlmacenDto: ActualizarAlmacenDto,
  ): Promise<Almacen> {
    try {
      const almacen = await this.obtenerAlmacen(id);

      // Validar dirección si se proporciona
      if (actualizarAlmacenDto.direccion_id) {
        // La validación se hará automáticamente por la foreign key
      }

      // Actualizar campos
      Object.assign(almacen, actualizarAlmacenDto);
      return await this.almacenRepository.save(almacen);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === '23503') {
        throw new NotFoundException('La dirección especificada no existe');
      }
      throw new InternalServerErrorException(
        'Error al actualizar el almacén',
        error.message,
      );
    }
  }

  async eliminarAlmacen(id: string): Promise<void> {
    try {
      const almacen = await this.obtenerAlmacen(id);

      // Verificar si hay movimientos asociados
      const movimientosOrigen = await this.movimientoRepository.count({
        where: { almacen_origen_id: id },
      });

      const movimientosDestino = await this.movimientoRepository.count({
        where: { almacen_destino_id: id },
      });

      if (movimientosOrigen > 0 || movimientosDestino > 0) {
        throw new BadRequestException(
          `No se puede eliminar el almacén porque tiene ${movimientosOrigen + movimientosDestino} movimiento(s) asociado(s)`,
        );
      }

      // Verificar si hay niveles de stock
      const nivelesStock = await this.nivelStockRepository.count({
        where: { almacen_id: id },
      });

      if (nivelesStock > 0) {
        throw new BadRequestException(
          `No se puede eliminar el almacén porque tiene ${nivelesStock} producto(s) con stock`,
        );
      }

      await this.almacenRepository.remove(almacen);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al eliminar el almacén',
        error.message,
      );
    }
  }

  // ========== MOVIMIENTOS (MÉTODO INTERNO TRANSACCIONAL) ==========

  /**
   * Método interno para crear movimientos de inventario.
   * Este método es transaccional y actualiza automáticamente los niveles de stock.
   * 
   * @param crearMovimientoDto Datos del movimiento a crear
   * @returns El movimiento creado
   * @throws NotFoundException Si el producto o almacén no existe
   * @throws BadRequestException Si la validación de negocio falla
   */
  async crearMovimiento(
    crearMovimientoDto: CrearMovimientoDto,
  ): Promise<Movimiento> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar que el producto existe y está activo
      const producto = await queryRunner.manager.findOne(Producto, {
        where: { producto_id: crearMovimientoDto.producto_id },
      });

      if (!producto) {
        throw new NotFoundException(
          `Producto con ID ${crearMovimientoDto.producto_id} no encontrado`,
        );
      }

      if (!producto.esta_activo) {
        throw new BadRequestException(
          `El producto ${producto.nombre} está inactivo`,
        );
      }

      // Validar que el producto es almacenable
      if (producto.tipo_producto !== 'ALMACENABLE') {
        throw new BadRequestException(
          `El producto ${producto.nombre} no es almacenable (tipo: ${producto.tipo_producto})`,
        );
      }

      // Validar almacenes según el tipo de movimiento
      const esEntrada = !crearMovimientoDto.almacen_origen_id;
      const esSalida = !crearMovimientoDto.almacen_destino_id;
      const esTransferencia =
        crearMovimientoDto.almacen_origen_id &&
        crearMovimientoDto.almacen_destino_id;

      if (!esEntrada && !esSalida && !esTransferencia) {
        throw new BadRequestException(
          'Debe especificar al menos un almacén (origen para salida, destino para entrada, o ambos para transferencia)',
        );
      }

      if (esTransferencia && crearMovimientoDto.almacen_origen_id === crearMovimientoDto.almacen_destino_id) {
        throw new BadRequestException(
          'El almacén de origen y destino no pueden ser el mismo',
        );
      }

      // Validar que los almacenes existen
      if (crearMovimientoDto.almacen_origen_id) {
        const almacenOrigen = await queryRunner.manager.findOne(Almacen, {
          where: { almacen_id: crearMovimientoDto.almacen_origen_id },
        });

        if (!almacenOrigen) {
          throw new NotFoundException(
            `Almacén de origen con ID ${crearMovimientoDto.almacen_origen_id} no encontrado`,
          );
        }
      }

      if (crearMovimientoDto.almacen_destino_id) {
        const almacenDestino = await queryRunner.manager.findOne(Almacen, {
          where: { almacen_id: crearMovimientoDto.almacen_destino_id },
        });

        if (!almacenDestino) {
          throw new NotFoundException(
            `Almacén de destino con ID ${crearMovimientoDto.almacen_destino_id} no encontrado`,
          );
        }
      }

      // Para salidas y transferencias, validar stock disponible
      if (esSalida || esTransferencia) {
        const almacenId = esSalida
          ? crearMovimientoDto.almacen_origen_id
          : crearMovimientoDto.almacen_origen_id;

        const nivelStock = await queryRunner.manager.findOne(NivelStock, {
          where: {
            producto_id: crearMovimientoDto.producto_id,
            almacen_id: almacenId!,
          },
        });

        const stockDisponible = nivelStock?.cantidad_disponible || 0;

        if (stockDisponible < crearMovimientoDto.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${crearMovimientoDto.cantidad}`,
          );
        }
      }

      // Crear el movimiento
      const movimiento = new Movimiento();
      movimiento.producto_id = crearMovimientoDto.producto_id;
      movimiento.almacen_origen_id = crearMovimientoDto.almacen_origen_id || undefined;
      movimiento.almacen_destino_id = crearMovimientoDto.almacen_destino_id || undefined;
      movimiento.cantidad = crearMovimientoDto.cantidad;
      movimiento.tipo_documento_origen = crearMovimientoDto.tipo_documento_origen || undefined;
      movimiento.id_documento_origen = crearMovimientoDto.id_documento_origen || undefined;
      movimiento.fecha_movimiento = new Date();

      const movimientoGuardado = await queryRunner.manager.save(movimiento);

      // Actualizar niveles de stock
      // Para salidas: restar del almacén de origen
      if (esSalida && crearMovimientoDto.almacen_origen_id) {
        await this.actualizarNivelStock(
          queryRunner,
          crearMovimientoDto.producto_id,
          crearMovimientoDto.almacen_origen_id,
          -crearMovimientoDto.cantidad,
        );
      }

      // Para entradas: sumar al almacén de destino
      if (esEntrada && crearMovimientoDto.almacen_destino_id) {
        await this.actualizarNivelStock(
          queryRunner,
          crearMovimientoDto.producto_id,
          crearMovimientoDto.almacen_destino_id,
          crearMovimientoDto.cantidad,
        );
      }

      // Para transferencias: restar del origen y sumar al destino
      if (esTransferencia) {
        await this.actualizarNivelStock(
          queryRunner,
          crearMovimientoDto.producto_id,
          crearMovimientoDto.almacen_origen_id!,
          -crearMovimientoDto.cantidad,
        );
        await this.actualizarNivelStock(
          queryRunner,
          crearMovimientoDto.producto_id,
          crearMovimientoDto.almacen_destino_id!,
          crearMovimientoDto.cantidad,
        );
      }

      await queryRunner.commitTransaction();
      return movimientoGuardado;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Re-lanzar excepciones conocidas
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Manejar errores de base de datos
      if (error.code === '23503') {
        throw new NotFoundException('Referencia a entidad inexistente');
      }

      throw new InternalServerErrorException(
        'Error al crear el movimiento de inventario',
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Método auxiliar para actualizar niveles de stock (UPSERT)
   */
  private async actualizarNivelStock(
    queryRunner: any,
    productoId: string,
    almacenId: string,
    cantidad: number,
  ): Promise<void> {
    const nivelStock = await queryRunner.manager.findOne(NivelStock, {
      where: {
        producto_id: productoId,
        almacen_id: almacenId,
      },
    });

    if (nivelStock) {
      // Actualizar existente
      nivelStock.cantidad_disponible =
        Number(nivelStock.cantidad_disponible) + cantidad;
      await queryRunner.manager.save(nivelStock);
    } else {
      // Crear nuevo registro
      const nuevoNivel = queryRunner.manager.create(NivelStock, {
        producto_id: productoId,
        almacen_id: almacenId,
        cantidad_disponible: cantidad,
      });
      await queryRunner.manager.save(nuevoNivel);
    }
  }

  // ========== TRANSFERENCIAS ==========

  async crearTransferencia(
    crearTransferenciaDto: CrearTransferenciaDto,
  ): Promise<{ movimiento_salida: Movimiento; movimiento_entrada: Movimiento }> {
    // Validar que es una transferencia válida
    if (
      !crearTransferenciaDto.almacen_origen_id ||
      !crearTransferenciaDto.almacen_destino_id
    ) {
      throw new BadRequestException(
        'Una transferencia requiere almacén de origen y destino',
      );
    }

    if (
      crearTransferenciaDto.almacen_origen_id ===
      crearTransferenciaDto.almacen_destino_id
    ) {
      throw new BadRequestException(
        'El almacén de origen y destino no pueden ser el mismo',
      );
    }

    // Crear movimiento de salida
    const movimientoSalida = await this.crearMovimiento({
      producto_id: crearTransferenciaDto.producto_id,
      almacen_origen_id: crearTransferenciaDto.almacen_origen_id,
      almacen_destino_id: undefined,
      cantidad: crearTransferenciaDto.cantidad,
      tipo_documento_origen: TipoDocumentoOrigen.TRANSFERENCIA,
    });

    // Crear movimiento de entrada
    const movimientoEntrada = await this.crearMovimiento({
      producto_id: crearTransferenciaDto.producto_id,
      almacen_origen_id: undefined,
      almacen_destino_id: crearTransferenciaDto.almacen_destino_id,
      cantidad: crearTransferenciaDto.cantidad,
      tipo_documento_origen: TipoDocumentoOrigen.TRANSFERENCIA,
      id_documento_origen: movimientoSalida.movimiento_id,
    });

    return {
      movimiento_salida: movimientoSalida,
      movimiento_entrada: movimientoEntrada,
    };
  }

  // ========== CONSULTAS DE STOCK ==========

  async obtenerNivelesStock(
    filtros: FiltrosStockDto,
  ): Promise<PaginacionResult<NivelStock>> {
    try {
      const { producto_id, almacen_id, page = 1, limit = 10 } = filtros;
      const skip = (page - 1) * limit;

      const queryBuilder =
        this.nivelStockRepository.createQueryBuilder('nivel');

      queryBuilder
        .leftJoinAndSelect('nivel.producto', 'producto')
        .leftJoinAndSelect('nivel.almacen', 'almacen');

      if (producto_id) {
        queryBuilder.andWhere('nivel.producto_id = :producto_id', {
          producto_id,
        });
      }

      if (almacen_id) {
        queryBuilder.andWhere('nivel.almacen_id = :almacen_id', {
          almacen_id,
        });
      }

      // Solo mostrar productos activos
      queryBuilder.andWhere('producto.esta_activo = :esta_activo', {
        esta_activo: true,
      });

      queryBuilder
        .orderBy('nivel.producto_id', 'ASC')
        .addOrderBy('nivel.almacen_id', 'ASC')
        .skip(skip)
        .take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los niveles de stock',
        error.message,
      );
    }
  }

  // ========== CONSULTAS DE MOVIMIENTOS ==========

  async obtenerMovimientos(
    filtros: FiltrosMovimientosDto,
  ): Promise<PaginacionResult<Movimiento>> {
    try {
      const {
        producto_id,
        almacen_origen_id,
        almacen_destino_id,
        tipo_documento_origen,
        id_documento_origen,
        fecha_desde,
        fecha_hasta,
        page = 1,
        limit = 10,
      } = filtros;
      const skip = (page - 1) * limit;

      const queryBuilder =
        this.movimientoRepository.createQueryBuilder('movimiento');

      queryBuilder
        .leftJoinAndSelect('movimiento.producto', 'producto')
        .leftJoinAndSelect('movimiento.almacen_origen', 'almacen_origen')
        .leftJoinAndSelect('movimiento.almacen_destino', 'almacen_destino');

      if (producto_id) {
        queryBuilder.andWhere('movimiento.producto_id = :producto_id', {
          producto_id,
        });
      }

      if (almacen_origen_id) {
        queryBuilder.andWhere(
          'movimiento.almacen_origen_id = :almacen_origen_id',
          { almacen_origen_id },
        );
      }

      if (almacen_destino_id) {
        queryBuilder.andWhere(
          'movimiento.almacen_destino_id = :almacen_destino_id',
          { almacen_destino_id },
        );
      }

      if (tipo_documento_origen) {
        queryBuilder.andWhere(
          'movimiento.tipo_documento_origen = :tipo_documento_origen',
          { tipo_documento_origen },
        );
      }

      if (id_documento_origen) {
        queryBuilder.andWhere(
          'movimiento.id_documento_origen = :id_documento_origen',
          { id_documento_origen },
        );
      }

      if (fecha_desde) {
        queryBuilder.andWhere(
          'movimiento.fecha_movimiento >= :fecha_desde',
          { fecha_desde },
        );
      }

      if (fecha_hasta) {
        queryBuilder.andWhere(
          'movimiento.fecha_movimiento <= :fecha_hasta',
          { fecha_hasta },
        );
      }

      queryBuilder
        .orderBy('movimiento.fecha_movimiento', 'DESC')
        .addOrderBy('movimiento.fecha_creacion', 'DESC')
        .skip(skip)
        .take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los movimientos',
        error.message,
      );
    }
  }

  async obtenerMovimiento(id: string): Promise<Movimiento> {
    try {
      const movimiento = await this.movimientoRepository.findOne({
        where: { movimiento_id: id },
        relations: ['producto', 'almacen_origen', 'almacen_destino'],
      });

      if (!movimiento) {
        throw new NotFoundException(
          `Movimiento con ID ${id} no encontrado`,
        );
      }

      return movimiento;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener el movimiento',
        error.message,
      );
    }
  }

  // ========== AJUSTES DE INVENTARIO ==========

  async crearAjusteInventario(
    ajusteInventarioDto: AjusteInventarioDto,
  ): Promise<Movimiento> {
    // Validar que el producto existe y es almacenable
    const producto = await this.productoRepository.findOne({
      where: { producto_id: ajusteInventarioDto.producto_id },
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${ajusteInventarioDto.producto_id} no encontrado`,
      );
    }

    if (!producto.esta_activo) {
      throw new BadRequestException('El producto está inactivo');
    }

    if (producto.tipo_producto !== 'ALMACENABLE') {
      throw new BadRequestException(
        'Solo se pueden hacer ajustes de inventario para productos almacenables',
      );
    }

    // Validar que el almacén existe
    await this.obtenerAlmacen(ajusteInventarioDto.almacen_id);

    // Para salidas, validar stock disponible
    if (ajusteInventarioDto.tipo_ajuste === TipoAjuste.SALIDA) {
      const nivelStock = await this.nivelStockRepository.findOne({
        where: {
          producto_id: ajusteInventarioDto.producto_id,
          almacen_id: ajusteInventarioDto.almacen_id,
        },
      });

      const stockDisponible = nivelStock?.cantidad_disponible || 0;

      if (stockDisponible < ajusteInventarioDto.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para el ajuste. Disponible: ${stockDisponible}, Solicitado: ${ajusteInventarioDto.cantidad}`,
        );
      }
    }

    // Crear el movimiento de ajuste
    const crearMovimientoDto: CrearMovimientoDto = {
      producto_id: ajusteInventarioDto.producto_id,
      almacen_origen_id:
        ajusteInventarioDto.tipo_ajuste === TipoAjuste.SALIDA
          ? ajusteInventarioDto.almacen_id
          : undefined,
      almacen_destino_id:
        ajusteInventarioDto.tipo_ajuste === TipoAjuste.ENTRADA
          ? ajusteInventarioDto.almacen_id
          : undefined,
      cantidad: ajusteInventarioDto.cantidad,
      tipo_documento_origen: TipoDocumentoOrigen.TRANSFERENCIA, // Usamos TRANSFERENCIA para ajustes manuales
    };

    return await this.crearMovimiento(crearMovimientoDto);
  }

  // ========== CONSULTAS AVANZADAS ==========

  /**
   * Obtiene el stock consolidado de un producto en todos los almacenes
   */
  async obtenerStockConsolidadoProducto(
    productoId: string,
  ): Promise<{ producto: Producto; stock_por_almacen: NivelStock[]; stock_total: number }> {
    try {
      const producto = await this.productoRepository.findOne({
        where: { producto_id: productoId },
      });

      if (!producto) {
        throw new NotFoundException(
          `Producto con ID ${productoId} no encontrado`,
        );
      }

      const nivelesStock = await this.nivelStockRepository.find({
        where: { producto_id: productoId },
        relations: ['almacen'],
        order: { almacen_id: 'ASC' },
      });

      const stockTotal = nivelesStock.reduce(
        (sum, nivel) => sum + Number(nivel.cantidad_disponible),
        0,
      );

      return {
        producto,
        stock_por_almacen: nivelesStock,
        stock_total: stockTotal,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener el stock consolidado',
        error.message,
      );
    }
  }

  /**
   * Obtiene todos los productos con stock en un almacén específico
   */
  async obtenerStockPorAlmacen(
    almacenId: string,
    filtros?: { solo_con_stock?: boolean },
  ): Promise<NivelStock[]> {
    try {
      // Validar que el almacén existe
      await this.obtenerAlmacen(almacenId);

      const queryBuilder =
        this.nivelStockRepository.createQueryBuilder('nivel');

      queryBuilder
        .leftJoinAndSelect('nivel.producto', 'producto')
        .leftJoinAndSelect('nivel.almacen', 'almacen')
        .where('nivel.almacen_id = :almacenId', { almacenId })
        .andWhere('producto.esta_activo = :esta_activo', { esta_activo: true });

      if (filtros?.solo_con_stock) {
        queryBuilder.andWhere('nivel.cantidad_disponible > 0');
      }

      queryBuilder
        .orderBy('producto.nombre', 'ASC')
        .addOrderBy('nivel.cantidad_disponible', 'DESC');

      return await queryBuilder.getMany();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener el stock del almacén',
        error.message,
      );
    }
  }

  /**
   * Valida si hay stock suficiente para un producto en un almacén (o en todos)
   */
  async validarDisponibilidadStock(
    validarStockDto: ValidarStockDto,
  ): Promise<{
    disponible: boolean;
    stock_disponible: number;
    almacen_id?: string;
    almacen_nombre?: string;
    mensaje: string;
  }> {
    try {
      const producto = await this.productoRepository.findOne({
        where: { producto_id: validarStockDto.producto_id },
      });

      if (!producto) {
        throw new NotFoundException(
          `Producto con ID ${validarStockDto.producto_id} no encontrado`,
        );
      }

      if (producto.tipo_producto !== 'ALMACENABLE') {
        return {
          disponible: false,
          stock_disponible: 0,
          mensaje: 'El producto no es almacenable',
        };
      }

      // Si se especifica un almacén, validar solo ese
      if (validarStockDto.almacen_id) {
        const nivelStock = await this.nivelStockRepository.findOne({
          where: {
            producto_id: validarStockDto.producto_id,
            almacen_id: validarStockDto.almacen_id,
          },
          relations: ['almacen'],
        });

        const stockDisponible = nivelStock?.cantidad_disponible || 0;
        const disponible = stockDisponible >= validarStockDto.cantidad;

        return {
          disponible,
          stock_disponible: stockDisponible,
          almacen_id: validarStockDto.almacen_id,
          almacen_nombre: nivelStock?.almacen?.nombre,
          mensaje: disponible
            ? `Stock suficiente. Disponible: ${stockDisponible}`
            : `Stock insuficiente. Disponible: ${stockDisponible}, Requerido: ${validarStockDto.cantidad}`,
        };
      }

      // Si no se especifica almacén, sumar stock de todos los almacenes
      const nivelesStock = await this.nivelStockRepository.find({
        where: { producto_id: validarStockDto.producto_id },
        relations: ['almacen'],
      });

      const stockTotal = nivelesStock.reduce(
        (sum, nivel) => sum + Number(nivel.cantidad_disponible),
        0,
      );

      const disponible = stockTotal >= validarStockDto.cantidad;

      return {
        disponible,
        stock_disponible: stockTotal,
        mensaje: disponible
          ? `Stock suficiente en total. Disponible: ${stockTotal}`
          : `Stock insuficiente en total. Disponible: ${stockTotal}, Requerido: ${validarStockDto.cantidad}`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al validar la disponibilidad de stock',
        error.message,
      );
    }
  }

  /**
   * Obtiene el historial completo de movimientos de un producto
   */
  async obtenerHistorialProducto(
    productoId: string,
    limite: number = 50,
  ): Promise<Movimiento[]> {
    try {
      const producto = await this.productoRepository.findOne({
        where: { producto_id: productoId },
      });

      if (!producto) {
        throw new NotFoundException(
          `Producto con ID ${productoId} no encontrado`,
        );
      }

      return await this.movimientoRepository.find({
        where: { producto_id: productoId },
        relations: ['almacen_origen', 'almacen_destino'],
        order: { fecha_movimiento: 'DESC', fecha_creacion: 'DESC' },
        take: limite,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener el historial del producto',
        error.message,
      );
    }
  }
}

