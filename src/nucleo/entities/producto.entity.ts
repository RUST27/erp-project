import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TipoProducto } from '../../common/enums';

@Entity('nucleo_productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  producto_id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  tipo_producto: TipoProducto;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: 0.0,
  })
  precio_venta_defecto: number;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: 0.0,
  })
  precio_costo_defecto: number;

  @Column({ type: 'boolean', default: true })
  esta_activo: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_creacion: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  fecha_actualizacion: Date;
}

