import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TipoDireccion } from '../../common/enums';
import { Entidad } from './entidad.entity';

@Entity('nucleo_direcciones')
export class Direccion {
  @PrimaryGeneratedColumn('uuid')
  direccion_id: string;

  @Column({ type: 'uuid', nullable: true })
  entidad_id?: string;

  @ManyToOne(() => Entidad, (entidad) => entidad.direcciones, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'entidad_id' })
  entidad?: Entidad;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  tipo_direccion?: TipoDireccion;

  @Column({ type: 'varchar', length: 255, nullable: true })
  calle?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ciudad?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  estado?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  codigo_postal?: string;

  @Column({ type: 'varchar', length: 100 })
  pais: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_creacion: Date;
}

