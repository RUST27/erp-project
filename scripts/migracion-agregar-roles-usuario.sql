-- Script de migración para agregar la tabla de roles de usuario
-- Ejecutar este script si ya tienes usuarios en la base de datos

-- Verificar si la tabla ya existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'nucleo_roles_usuario') THEN
        -- Crear la tabla de roles de usuario
        CREATE TABLE nucleo_roles_usuario (
            usuario_id UUID NOT NULL REFERENCES nucleo_usuarios(usuario_id) ON DELETE CASCADE,
            tipo_rol VARCHAR(20) NOT NULL CHECK (tipo_rol IN ('ADMIN', 'VENTAS', 'COMPRAS', 'INVENTARIO', 'CONTABILIDAD', 'USUARIO')),
            fecha_asignacion TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (usuario_id, tipo_rol)
        );

        -- Crear índices
        CREATE INDEX idx_nucleo_roles_usuario_usuario ON nucleo_roles_usuario(usuario_id);
        CREATE INDEX idx_nucleo_roles_usuario_rol ON nucleo_roles_usuario(tipo_rol);

        RAISE NOTICE 'Tabla nucleo_roles_usuario creada exitosamente';
    ELSE
        RAISE NOTICE 'La tabla nucleo_roles_usuario ya existe';
    END IF;
END $$;

