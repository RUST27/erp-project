import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { EstadoOrdenCompra } from '../../common/enums';
import { Entidad } from '../../nucleo/entities/entidad.entity';
import { Direccion } from '../../nucleo/entities/direccion.entity';
import { LineaOrden } from './linea-orden.entity';
import { FacturaProveedor } from './factura-proveedor.entity';

@Entity('compras_ordenes')
export class OrdenCompra {
  @PrimaryGeneratedColumn('uuid')
  orden_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  referencia_orden: string;

  @Column({ type: 'uuid' })
  proveedor_id: string;

  @ManyToOne(() => Entidad, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Entidad;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  fecha_orden: Date;

  @Column({ type: 'date', nullable: true })
  fecha_entrega_esperada?: Date;

  @Column({
    type: 'varchar',
    length: 20,
  })
  estado: EstadoOrdenCompra;

  @Column({ type: 'uuid', nullable: true })
  direccion_entrega_id?: string;

  @ManyToOne(() => Direccion, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'direccion_entrega_id' })
  direccion_entrega?: Direccion;

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
  @OneToMany(() => LineaOrden, (linea) => linea.orden, { cascade: true })
  lineas: LineaOrden[];

  @OneToMany(() => FacturaProveedor, (factura) => factura.orden_compra)
  facturas: FacturaProveedor[];
}

