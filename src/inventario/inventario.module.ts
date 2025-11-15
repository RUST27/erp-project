import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { Almacen } from './entities/almacen.entity';
import { Movimiento } from './entities/movimiento.entity';
import { NivelStock } from './entities/nivel-stock.entity';
import { Producto } from '../nucleo/entities/producto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Almacen, Movimiento, NivelStock, Producto]),
  ],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService], // Exportar para que otros módulos puedan usarlo
})
export class InventarioModule {}

