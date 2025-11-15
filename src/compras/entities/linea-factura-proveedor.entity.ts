import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FacturaProveedor } from './factura-proveedor.entity';
import { Producto } from '../../nucleo/entities/producto.entity';

@Entity('compras_lineas_factura_proveedor')
export class LineaFacturaProveedor {
  @PrimaryGeneratedColumn('uuid')
  linea_id: string;

  @Column({ type: 'uuid' })
  factura_prov_id: string;

  @ManyToOne(() => FacturaProveedor, (factura) => factura.lineas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'factura_prov_id' })
  factura_proveedor: FacturaProveedor;

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

