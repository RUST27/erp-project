import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { EstadoFacturaProveedor } from '../../common/enums';
import { Entidad } from '../../nucleo/entities/entidad.entity';
import { OrdenCompra } from './orden-compra.entity';
import { LineaFacturaProveedor } from './linea-factura-proveedor.entity';

@Entity('compras_facturas_proveedor')
@Index(['proveedor_id', 'numero_factura_proveedor'], { unique: true })
export class FacturaProveedor {
  @PrimaryGeneratedColumn('uuid')
  factura_prov_id: string;

  @Column({ type: 'varchar', length: 100 })
  numero_factura_proveedor: string;

  @Column({ type: 'uuid' })
  proveedor_id: string;

  @ManyToOne(() => Entidad, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Entidad;

  @Column({ type: 'uuid', nullable: true })
  orden_compra_id?: string;

  @ManyToOne(() => OrdenCompra, (orden) => orden.facturas, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'orden_compra_id' })
  orden_compra?: OrdenCompra;

  @Column({ type: 'date' })
  fecha_factura: Date;

  @Column({ type: 'date' })
  fecha_vencimiento: Date;

  @Column({
    type: 'varchar',
    length: 20,
  })
  estado: EstadoFacturaProveedor;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: 0.0,
  })
  monto_total: number;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_creacion: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  fecha_actualizacion: Date;

  // Relaciones
  @OneToMany(() => LineaFacturaProveedor, (linea) => linea.factura_proveedor, {
    cascade: true,
  })
  lineas: LineaFacturaProveedor[];
}

