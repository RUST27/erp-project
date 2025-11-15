import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NucleoService } from './nucleo.service';
import { NucleoController } from './nucleo.controller';
import { Producto } from './entities/producto.entity';
import { Entidad } from './entities/entidad.entity';
import { RolEntidad } from './entities/rol-entidad.entity';
import { Usuario } from './entities/usuario.entity';
import { RolUsuario } from './entities/rol-usuario.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Entidad, RolEntidad, Usuario, RolUsuario]),
    AuthModule, // Para usar AuthService.hashPassword
  ],
  controllers: [NucleoController],
  providers: [NucleoService],
  exports: [NucleoService],
})
export class NucleoModule {}

