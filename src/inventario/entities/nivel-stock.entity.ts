import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Producto } from '../../nucleo/entities/producto.entity';
import { Almacen } from './almacen.entity';

@Entity('inventario_niveles_stock')
export class NivelStock {
  @PrimaryColumn({ type: 'uuid' })
  producto_id: string;

  @ManyToOne(() => Producto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @PrimaryColumn({ type: 'uuid' })
  almacen_id: string;

  @ManyToOne(() => Almacen, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'almacen_id' })
  almacen: Almacen;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    default: 0.0,
  })
  cantidad_disponible: number;
}

