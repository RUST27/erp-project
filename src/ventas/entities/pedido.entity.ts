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
import { EstadoPedido } from '../../common/enums';
import { Entidad } from '../../nucleo/entities/entidad.entity';
import { Direccion } from '../../nucleo/entities/direccion.entity';
import { LineaPedido } from './linea-pedido.entity';
import { Factura } from './factura.entity';

@Entity('ventas_pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  pedido_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  referencia_pedido: string;

  @Column({ type: 'uuid' })
  cliente_id: string;

  @ManyToOne(() => Entidad, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Entidad;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  fecha_pedido: Date;

  @Column({
    type: 'varchar',
    length: 20,
  })
  estado: EstadoPedido;

  @Column({ type: 'uuid', nullable: true })
  direccion_envio_id?: string;

  @ManyToOne(() => Direccion, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'direccion_envio_id' })
  direccion_envio?: Direccion;

  @Column({ type: 'uuid', nullable: true })
  direccion_facturacion_id?: string;

  @ManyToOne(() => Direccion, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'direccion_facturacion_id' })
  direccion_facturacion?: Direccion;

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
  @OneToMany(() => LineaPedido, (linea) => linea.pedido, { cascade: true })
  lineas: LineaPedido[];

  @OneToMany(() => Factura, (factura) => factura.pedido)
  facturas: Factura[];
}

