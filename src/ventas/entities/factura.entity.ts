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
import { EstadoFactura } from '../../common/enums';
import { Entidad } from '../../nucleo/entities/entidad.entity';
import { Pedido } from './pedido.entity';
import { LineaFactura } from './linea-factura.entity';

@Entity('ventas_facturas')
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  factura_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  numero_factura: string;

  @Column({ type: 'uuid' })
  cliente_id: string;

  @ManyToOne(() => Entidad, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Entidad;

  @Column({ type: 'uuid', nullable: true })
  pedido_id?: string;

  @ManyToOne(() => Pedido, (pedido) => pedido.facturas, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'pedido_id' })
  pedido?: Pedido;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  fecha_factura: Date;

  @Column({ type: 'date' })
  fecha_vencimiento: Date;

  @Column({
    type: 'varchar',
    length: 20,
  })
  estado: EstadoFactura;

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
  @OneToMany(() => LineaFactura, (linea) => linea.factura, { cascade: true })
  lineas: LineaFactura[];
}

