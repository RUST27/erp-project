import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Direccion } from '../../nucleo/entities/direccion.entity';

@Entity('inventario_almacenes')
export class Almacen {
  @PrimaryGeneratedColumn('uuid')
  almacen_id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'uuid', nullable: true })
  direccion_id?: string;

  @ManyToOne(() => Direccion, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'direccion_id' })
  direccion?: Direccion;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_creacion: Date;
}

