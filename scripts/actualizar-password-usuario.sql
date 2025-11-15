-- Script para actualizar la contraseña de un usuario existente
-- IMPORTANTE: Primero ejecuta el script generar-hash-password.js para obtener el hash
-- Luego reemplaza los valores en este script:
-- 1. 'tu_email@ejemplo.com' con el email del usuario
-- 2. 'HASH_GENERADO_AQUI' con el hash que obtuviste del script JavaScript

UPDATE nucleo_usuarios
SET 
    hash_contrasena = 'HASH_GENERADO_AQUI',
    fecha_actualizacion = NOW()
WHERE email = 'tu_email@ejemplo.com';

-- Verificar que se actualizó correctamente
SELECT 
    usuario_id,
    email,
    esta_activo,
    CASE 
        WHEN hash_contrasena IS NULL THEN 'SIN CONTRASEÑA'
        WHEN LENGTH(hash_contrasena) < 20 THEN 'HASH INVÁLIDO'
        ELSE 'CONTRASEÑA ACTUALIZADA'
    END as estado_contrasena
FROM nucleo_usuarios
WHERE email = 'tu_email@ejemplo.com';

