import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Entidad } from './entidad.entity';
import { RolUsuario } from './rol-usuario.entity';

@Entity('nucleo_usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  usuario_id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  hash_contrasena: string;

  @Column({ type: 'uuid', nullable: true })
  entidad_id?: string;

  @ManyToOne(() => Entidad, (entidad) => entidad.usuarios, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'entidad_id' })
  entidad?: Entidad;

  @Column({ type: 'boolean', default: true })
  esta_activo: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_creacion: Date;

  // Relaciones
  @OneToMany(() => RolUsuario, (rol) => rol.usuario)
  roles: RolUsuario[];
}

