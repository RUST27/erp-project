import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TipoRol } from '../../common/enums';
import { Entidad } from './entidad.entity';

@Entity('nucleo_roles_entidad')
export class RolEntidad {
  @PrimaryColumn({ type: 'uuid' })
  entidad_id: string;

  @ManyToOne(() => Entidad, (entidad) => entidad.roles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'entidad_id' })
  entidad: Entidad;

  @PrimaryColumn({
    type: 'varchar',
    length: 20,
  })
  tipo_rol: TipoRol;
}

