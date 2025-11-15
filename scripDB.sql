-- Para usar extensiones de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla central para todas las "entidades": personas, compañías, etc.
CREATE TABLE nucleo_entidades (
    entidad_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_entidad VARCHAR(20) NOT NULL CHECK (tipo_entidad IN ('ORGANIZACION', 'PERSONA')),
    nombre_mostrado VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(50),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Direcciones que pueden ser compartidas por varias entidades
CREATE TABLE nucleo_direcciones (
    direccion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entidad_id UUID REFERENCES nucleo_entidades(entidad_id) ON DELETE SET NULL,
    tipo_direccion VARCHAR(20) CHECK (tipo_direccion IN ('ENVIO', 'FACTURACION', 'HOGAR', 'OFICINA')),
    calle VARCHAR(255),
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(20),
    pais VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Define los "roles" que una entidad puede tener
CREATE TABLE nucleo_roles_entidad (
    entidad_id UUID NOT NULL REFERENCES nucleo_entidades(entidad_id) ON DELETE CASCADE,
    tipo_rol VARCHAR(20) NOT NULL CHECK (tipo_rol IN ('CLIENTE', 'PROVEEDOR', 'EMPLEADO')),
    PRIMARY KEY (entidad_id, tipo_rol) -- Una entidad solo puede tener cada rol una vez
);

-- Productos y servicios que la empresa compra o vende
CREATE TABLE nucleo_productos (
    producto_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL, -- "Stock Keeping Unit"
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_producto VARCHAR(20) NOT NULL CHECK (tipo_producto IN ('ALMACENABLE', 'SERVICIO', 'CONSUMIBLE')),
    precio_venta_defecto NUMERIC(19, 4) DEFAULT 0.00,
    precio_costo_defecto NUMERIC(19, 4) DEFAULT 0.00,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Usuarios que acceden al sistema
CREATE TABLE nucleo_usuarios (
    usuario_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hash_contrasena VARCHAR(255) NOT NULL,
    entidad_id UUID REFERENCES nucleo_entidades(entidad_id) ON DELETE SET NULL, -- Vincula al usuario con una entidad "Persona"
    esta_activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- ventas

CREATE TABLE ventas_pedidos (
    pedido_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referencia_pedido VARCHAR(50) UNIQUE NOT NULL, -- Ej: "PV-2025-0001"
    cliente_id UUID NOT NULL REFERENCES nucleo_entidades(entidad_id) ON DELETE RESTRICT,
    fecha_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('BORRADOR', 'CONFIRMADO', 'ENVIADO', 'FACTURADO', 'CANCELADO')),
    direccion_envio_id UUID REFERENCES nucleo_direcciones(direccion_id) ON DELETE SET NULL,
    direccion_facturacion_id UUID REFERENCES nucleo_direcciones(direccion_id) ON DELETE SET NULL,
    monto_total NUMERIC(19, 4) DEFAULT 0.00,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ventas_lineas_pedido (
    linea_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES ventas_pedidos(pedido_id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES nucleo_productos(producto_id) ON DELETE RESTRICT,
    descripcion TEXT, -- Puede sobreescribir la descripción del producto
    cantidad NUMERIC(18, 4) NOT NULL,
    precio_unitario NUMERIC(19, 4) NOT NULL,
    subtotal NUMERIC(19, 4) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Facturas a clientes
CREATE TABLE ventas_facturas (
    factura_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_factura VARCHAR(50) UNIQUE NOT NULL, -- Ej: "FACT-2025-0001"
    cliente_id UUID NOT NULL REFERENCES nucleo_entidades(entidad_id) ON DELETE RESTRICT,
    pedido_id UUID REFERENCES ventas_pedidos(pedido_id) ON DELETE SET NULL, -- Vínculo opcional al pedido
    fecha_factura DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('BORRADOR', 'ENVIADA', 'PAGADA', 'PAGADA_PARCIAL', 'ANULADA')),
    monto_total NUMERIC(19, 4) DEFAULT 0.00,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ventas_lineas_factura (
    linea_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factura_id UUID NOT NULL REFERENCES ventas_facturas(factura_id) ON DELETE CASCADE,
    producto_id UUID REFERENCES nucleo_productos(producto_id) ON DELETE RESTRICT,
    descripcion TEXT NOT NULL,
    cantidad NUMERIC(18, 4) NOT NULL,
    precio_unitario NUMERIC(19, 4) NOT NULL,
    subtotal NUMERIC(19, 4) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);

-- compras 
CREATE TABLE compras_ordenes (
    orden_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referencia_orden VARCHAR(50) UNIQUE NOT NULL, -- Ej: "OC-2025-0001"
    proveedor_id UUID NOT NULL REFERENCES nucleo_entidades(entidad_id) ON DELETE RESTRICT,
    fecha_orden DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_entrega_esperada DATE,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('BORRADOR', 'CONFIRMADA', 'RECIBIDA', 'FACTURADA', 'CANCELADA')),
    direccion_entrega_id UUID REFERENCES nucleo_direcciones(direccion_id) ON DELETE SET NULL,
    monto_total NUMERIC(19, 4) DEFAULT 0.00,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE compras_lineas_orden (
    linea_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID NOT NULL REFERENCES compras_ordenes(orden_id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES nucleo_productos(producto_id) ON DELETE RESTRICT,
    descripcion TEXT,
    cantidad NUMERIC(18, 4) NOT NULL,
    precio_unitario NUMERIC(19, 4) NOT NULL, -- Este es el "costo"
    subtotal NUMERIC(19, 4) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Facturas de proveedores (Cuentas por Pagar)
CREATE TABLE compras_facturas_proveedor (
    factura_prov_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_factura_proveedor VARCHAR(100) NOT NULL, -- Número de factura que te da el proveedor
    proveedor_id UUID NOT NULL REFERENCES nucleo_entidades(entidad_id) ON DELETE RESTRICT,
    orden_compra_id UUID REFERENCES compras_ordenes(orden_id) ON DELETE SET NULL,
    fecha_factura DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('BORRADOR', 'RECIBIDA', 'PAGADA', 'ANULADA')),
    monto_total NUMERIC(19, 4) DEFAULT 0.00,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE compras_lineas_factura_proveedor (
    linea_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factura_prov_id UUID NOT NULL REFERENCES compras_facturas_proveedor(factura_prov_id) ON DELETE CASCADE,
    producto_id UUID REFERENCES nucleo_productos(producto_id) ON DELETE RESTRICT,
    descripcion TEXT NOT NULL,
    cantidad NUMERIC(18, 4) NOT NULL,
    precio_unitario NUMERIC(19, 4) NOT NULL,
    subtotal NUMERIC(19, 4) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);

-- inventario
CREATE TABLE inventario_almacenes (
    almacen_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    direccion_id UUID REFERENCES nucleo_direcciones(direccion_id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Nivel de stock actual (la "foto" del inventario)
CREATE TABLE inventario_niveles_stock (
    producto_id UUID NOT NULL REFERENCES nucleo_productos(producto_id) ON DELETE CASCADE,
    almacen_id UUID NOT NULL REFERENCES inventario_almacenes(almacen_id) ON DELETE CASCADE,
    cantidad_disponible NUMERIC(18, 4) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (producto_id, almacen_id)
);

-- El "libro de contabilidad" del inventario. Inmutable.
CREATE TABLE inventario_movimientos (
    movimiento_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES nucleo_productos(producto_id) ON DELETE RESTRICT,
    almacen_origen_id UUID REFERENCES inventario_almacenes(almacen_id) ON DELETE RESTRICT, -- NULL si es una entrada (compra)
    almacen_destino_id UUID REFERENCES inventario_almacenes(almacen_id) ON DELETE RESTRICT,   -- NULL si es una salida (venta)
    cantidad NUMERIC(18, 4) NOT NULL, -- Siempre positivo
    fecha_movimiento TIMESTAMPTZ DEFAULT NOW(),
    -- Vínculo al documento que originó el movimiento
    tipo_documento_origen VARCHAR(30), -- 'VENTAS_PEDIDOS', 'COMPRAS_ORDENES', 'TRANSFERENCIA'
    id_documento_origen UUID,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 