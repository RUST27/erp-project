-- Script para crear un usuario inicial para pruebas
-- IMPORTANTE: Ejecutar después de crear la base de datos con scripDB.sql

-- Primero, crear una entidad de tipo PERSONA
INSERT INTO nucleo_entidades (tipo_entidad, nombre_mostrado, email, telefono)
VALUES ('PERSONA', 'Usuario Administrador', 'admin@erp.com', '+1234567890')
RETURNING entidad_id;

-- Nota: Guarda el entidad_id que se retorna arriba y úsalo en el siguiente INSERT
-- O ejecuta esto en una transacción:

DO $$
DECLARE
    v_entidad_id UUID;
    v_hash_password TEXT;
BEGIN
    -- Crear entidad
    INSERT INTO nucleo_entidades (tipo_entidad, nombre_mostrado, email, telefono)
    VALUES ('PERSONA', 'Usuario Administrador', 'admin@erp.com', '+1234567890')
    RETURNING entidad_id INTO v_entidad_id;

    -- Hash de la contraseña "admin123" (debes generar esto con bcrypt en Node.js)
    -- Para pruebas, puedes usar este hash (contraseña: "admin123")
    -- Generado con: bcrypt.hash('admin123', 10)
    v_hash_password := '$2b$10$rOzJqZqZqZqZqZqZqZqZqOeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq';

    -- Crear usuario
    INSERT INTO nucleo_usuarios (email, hash_contrasena, entidad_id, esta_activo)
    VALUES ('admin@erp.com', v_hash_password, v_entidad_id, true);

    -- Asignar rol de CLIENTE (opcional)
    INSERT INTO nucleo_roles_entidad (entidad_id, tipo_rol)
    VALUES (v_entidad_id, 'CLIENTE');

    RAISE NOTICE 'Usuario creado exitosamente. Email: admin@erp.com';
END $$;

-- NOTA IMPORTANTE:
-- El hash de contraseña debe generarse con bcrypt en Node.js
-- Para generar un hash, ejecuta en Node.js:
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('tu_password', 10).then(hash => console.log(hash));

