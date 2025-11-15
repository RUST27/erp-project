import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Obtener ConfigService
  const configService = app.get(ConfigService);
  
  // Habilitar validación global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma automáticamente los tipos
      transformOptions: {
        enableImplicitConversion: true, // Convierte tipos implícitamente
      },
    }),
  );

  // Habilitar CORS (ajustar según necesidades)
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    credentials: true,
  });

  // Configuración de Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('ERP API')
    .setDescription('API REST para el sistema ERP (MVP) - Gestión de Ventas, Compras e Inventario')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT',
        in: 'header',
      },
      'JWT-auth', // Este nombre se usará en los decoradores @ApiBearerAuth
    )
    .addTag('auth', 'Endpoints de autenticación y registro')
    .addTag('nucleo', 'Gestión de productos, entidades y usuarios')
    .addTag('ventas', 'Gestión de pedidos y facturas de venta')
    .addTag('compras', 'Gestión de órdenes de compra y facturas de proveedor')
    .addTag('inventario', 'Gestión de almacenes, stock y movimientos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Mantiene el token en sesión
    },
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger disponible en: http://localhost:${port}/api`);
}
bootstrap();
