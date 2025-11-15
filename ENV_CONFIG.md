# Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
# Configuración de Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password_aqui
DB_DATABASE=erp_db

# Configuración de JWT
JWT_SECRET=tu_secret_key_super_segura_cambiar_en_produccion
JWT_EXPIRES_IN=24h

# Configuración del Servidor
PORT=3000
NODE_ENV=development
```

## Notas Importantes:

1. **DB_PASSWORD**: Reemplaza `tu_password_aqui` con la contraseña de tu base de datos PostgreSQL
2. **JWT_SECRET**: Debe ser una cadena aleatoria y segura. En producción, usa un generador de secretos fuerte
3. **DB_DATABASE**: Asegúrate de que la base de datos exista antes de ejecutar la aplicación
4. **NODE_ENV**: 
   - `development` para desarrollo
   - `production` para producción

## Generar JWT_SECRET seguro:

Puedes generar un JWT_SECRET seguro usando Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

O usando OpenSSL:
```bash
openssl rand -hex 64
```

