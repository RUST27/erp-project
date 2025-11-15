import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TipoDocumentoOrigen } from '../../common/enums';
import { Producto } from '../../nucleo/entities/producto.entity';
import { Almacen } from './almacen.entity';

@Entity('inventario_movimientos')
export class Movimiento {
  @PrimaryGeneratedColumn('uuid')
  movimiento_id: string;

  @Column({ type: 'uuid' })
  producto_id: string;

  @ManyToOne(() => Producto, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ type: 'uuid', nullable: true })
  almacen_origen_id?: string;

  @ManyToOne(() => Almacen, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'almacen_origen_id' })
  almacen_origen?: Almacen;

  @Column({ type: 'uuid', nullable: true })
  almacen_destino_id?: string;

  @ManyToOne(() => Almacen, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'almacen_destino_id' })
  almacen_destino?: Almacen;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
  })
  cantidad: number;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  fecha_movimiento: Date;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  tipo_documento_origen?: TipoDocumentoOrigen;

  @Column({ type: 'uuid', nullable: true })
  id_documento_origen?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_creacion: Date;
}

