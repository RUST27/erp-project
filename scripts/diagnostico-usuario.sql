-- Script de diagnóstico para verificar el estado de un usuario
-- Reemplaza 'tu_email@ejemplo.com' con el email del usuario que quieres verificar

-- Verificar si el usuario existe y su estado
SELECT 
    u.usuario_id,
    u.email,
    u.esta_activo,
    u.entidad_id,
    CASE 
        WHEN u.hash_contrasena IS NULL THEN 'SIN CONTRASEÑA'
        WHEN LENGTH(u.hash_contrasena) < 20 THEN 'HASH INVÁLIDO'
        ELSE 'CONTRASEÑA CONFIGURADA'
    END as estado_contrasena,
    e.nombre_mostrado as nombre_entidad,
    e.tipo_entidad
FROM nucleo_usuarios u
LEFT JOIN nucleo_entidades e ON u.entidad_id = e.entidad_id
WHERE u.email = 'tu_email@ejemplo.com';

-- Verificar roles del usuario
SELECT 
    ru.tipo_rol,
    ru.fecha_asignacion
FROM nucleo_roles_usuario ru
INNER JOIN nucleo_usuarios u ON ru.usuario_id = u.usuario_id
WHERE u.email = 'tu_email@ejemplo.com';

-- Si no hay resultados, el usuario no existe o el email es incorrecto

