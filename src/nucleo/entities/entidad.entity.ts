import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TipoEntidad } from '../../common/enums';
import { Direccion } from './direccion.entity';
import { Usuario } from './usuario.entity';
import { RolEntidad } from './rol-entidad.entity';

@Entity('nucleo_entidades')
export class Entidad {
  @PrimaryGeneratedColumn('uuid')
  entidad_id: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  tipo_entidad: TipoEntidad;

  @Column({ type: 'varchar', length: 255 })
  nombre_mostrado: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_creacion: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  fecha_actualizacion: Date;

  // Relaciones
  @OneToMany(() => Direccion, (direccion) => direccion.entidad)
  direcciones: Direccion[];

  @OneToMany(() => Usuario, (usuario) => usuario.entidad)
  usuarios: Usuario[];

  @OneToMany(() => RolEntidad, (rol) => rol.entidad)
  roles: RolEntidad[];
}

