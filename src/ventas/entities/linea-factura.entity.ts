import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Factura } from './factura.entity';
import { Producto } from '../../nucleo/entities/producto.entity';

@Entity('ventas_lineas_factura')
export class LineaFactura {
  @PrimaryGeneratedColumn('uuid')
  linea_id: string;

  @Column({ type: 'uuid' })
  factura_id: string;

  @ManyToOne(() => Factura, (factura) => factura.lineas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'factura_id' })
  factura: Factura;

  @Column({ type: 'uuid', nullable: true })
  producto_id?: string;

  @ManyToOne(() => Producto, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'producto_id' })
  producto?: Producto;

  @Column({ type: 'text' })
  descripcion: string;

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
}

