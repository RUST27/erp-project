import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { TipoRolUsuario } from '../../common/enums';
import { Usuario } from './usuario.entity';

@Entity('nucleo_roles_usuario')
export class RolUsuario {
  @PrimaryColumn({ type: 'uuid' })
  usuario_id: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.roles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @PrimaryColumn({
    type: 'varchar',
    length: 20,
  })
  tipo_rol: TipoRolUsuario;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_asignacion: Date;
}

