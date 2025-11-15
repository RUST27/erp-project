import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from '../../nucleo/entities/producto.entity';

@Entity('ventas_lineas_pedido')
export class LineaPedido {
  @PrimaryGeneratedColumn('uuid')
  linea_id: string;

  @Column({ type: 'uuid' })
  pedido_id: string;

  @ManyToOne(() => Pedido, (pedido) => pedido.lineas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

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

