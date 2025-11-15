import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Usuario } from '../nucleo/entities/usuario.entity';
import { Entidad } from '../nucleo/entities/entidad.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET no está configurado en las variables de entorno');
        }
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '24h');
        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as any, // jsonwebtoken acepta string como expiresIn
          },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Usuario, Entidad]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}

