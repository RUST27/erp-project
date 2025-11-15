import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrdenCompra } from './orden-compra.entity';
import { Producto } from '../../nucleo/entities/producto.entity';

@Entity('compras_lineas_orden')
export class LineaOrden {
  @PrimaryGeneratedColumn('uuid')
  linea_id: string;

  @Column({ type: 'uuid' })
  orden_id: string;

  @ManyToOne(() => OrdenCompra, (orden) => orden.lineas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orden_id' })
  orden: OrdenCompra;

  @Column({ type: 'uuid' })
  producto_id: string;

  @ManyToOne(() => Producto, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
  })
  cantidad: number;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 4,
  })
  precio_unitario: number;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 4,
    generatedType: 'STORED',
    asExpression: 'cantidad * precio_unitario',
  })
  subtotal: number;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_creacion: Date;
}

