# 🚀 Proyecto: ERP-MVP (Backend)

Documento que define la estructura, los requerimientos y el plan de desarrollo para el backend del sistema ERP (MVP) utilizando NestJS, TypeORM y PostgreSQL.

## 1. Stack Tecnológico

* **Framework:** NestJS
* **Lenguaje:** TypeScript
* **ORM:** TypeORM
* **Base de Datos:** PostgreSQL
* **Autenticación:** JWT (JSON Web Tokens)
* **Configuración:** `@nestjs/config` (para variables de entorno `.env`)
* **Validación:** `class-validator`, `class-transformer` (para DTOs)

## 2. Estructura del Proyecto

La estructura de carpetas está diseñada para ser modular y escalable. Cada módulo de negocio (Núcleo, Ventas, etc.) es autónomo y contiene sus propios controladores, servicios, entidades y DTOs.

erp-backend/
│
├── .env                  # Variables de entorno (DB_HOST, JWT_SECRET, etc.)
├── .gitignore
├── nest-cli.json
├── package.json
├── README.md             # Este documento
├── tsconfig.build.json
├── tsconfig.json
│
└── src/
    │
    ├── main.ts             # Punto de entrada de la aplicación
    ├── app.module.ts       # Módulo raíz (importa los demás módulos)
    ├── app.controller.ts   # Controlador de prueba (opcional)
    ├── app.service.ts      # Servicio de prueba (opcional)
    │
    ├── common/             # Lógica compartida
    │   ├── dtos/           # DTOs base (ej. PaginacionDto)
    │   ├── enums/          # Enumeradores globales (ej. TipoRol)
    │   └── guards/         # Guards de autenticación (ej. JwtAuthGuard)
    │
    ├── auth/               # Módulo de Autenticación
    │   ├── auth.module.ts
    │   ├── auth.service.ts
    │   ├── auth.controller.ts
    │   ├── strategies/     # (ej. JwtStrategy)
    │   └── dto/            # (ej. LoginDto)
    │
    ├── nucleo/             # Módulo Núcleo (Clientes, Proveedores, Productos)
    │   ├── nucleo.module.ts
    │   ├── nucleo.controller.ts
    │   ├── nucleo.service.ts
    │   ├── entities/
    │   │   ├── entidad.entity.ts
    │   │   ├── producto.entity.ts
    │   │   ├── direccion.entity.ts
    │   │   └── usuario.entity.ts
    │   └── dto/
    │       ├── crear-producto.dto.ts
    │       ├── actualizar-producto.dto.ts
    │       ├── crear-entidad.dto.ts
    │       └── ...
    │
    ├── ventas/             # Módulo de Ventas
    │   ├── ventas.module.ts
    │   ├── ventas.controller.ts
    │   ├── ventas.service.ts
    │   ├── entities/
    │   │   ├── pedido.entity.ts
    │   │   ├── linea-pedido.entity.ts
    │   │   ├── factura.entity.ts
    │   │   └── linea-factura.entity.ts
    │   └── dto/
    │       ├── crear-pedido.dto.ts
    │       └── ...
    │
    ├── compras/            # Módulo de Compras
    │   ├── compras.module.ts
    │   ├── ... (controlador, servicio)
    │   ├── entities/
    │   │   ├── orden-compra.entity.ts
    │   │   └── factura-proveedor.entity.ts
    │   └── dto/
    │       ├── crear-orden-compra.dto.ts
    │       └── ...
    │
    └── inventario/         # Módulo de Inventario
        ├── inventario.module.ts
        ├── ... (controlador, servicio)
        ├── entities/
        │   ├── almacen.entity.ts
        │   ├── movimiento.entity.ts
        │   └── nivel-stock.entity.ts
        └── dto/
            ├── crear-transferencia.dto.ts
            └── ...

## 3. Requerimientos de Desarrollo (MVP)

A continuación, se detallan los *endpoints* y la lógica de negocio mínima requerida por módulo.

### 🔑 Módulo de Autenticación (`/auth`)

El acceso a todos los demás *endpoints* debe estar protegido.

* **`POST /auth/login`**:
    * **Input:** `LoginDto` (`email`, `password`).
    * **Output:** `AccessToken` (JWT).
    * **Lógica:** Valida credenciales contra `nucleo_usuarios`. Genera un JWT.
* **`GET /auth/perfil`**:
    * **Input:** Requiere `JwtAuthGuard`.
    * **Output:** Datos del usuario logueado.
* **Estrategia JWT**: Debe implementarse (`JwtStrategy`) para validar tokens en cada petición protegida.
* **Guards**: Crear un `JwtAuthGuard` global o aplicarlo en los controladores que lo necesiten.

---

### 📦 Módulo Núcleo (`/nucleo`)

Base de datos maestra del sistema.

* **Gestión de Productos (`/productos`)**:
    * `POST /productos`: Crear un nuevo producto (`crear-producto.dto.ts`).
    * `GET /productos`: Listar productos (con paginación).
    * `GET /productos/:id`: Obtener un producto.
    * `PATCH /productos/:id`: Actualizar un producto (`actualizar-producto.dto.ts`).
    * `DELETE /productos/:id`: Desactivar un producto (borrado lógico).
* **Gestión de Entidades (`/entidades`)**:
    * `POST /entidades`: Crear una nueva entidad (cliente, proveedor).
    * `GET /entidades`: Listar entidades (con filtros, ej. `?tipo_rol=CLIENTE`).
    * `GET /entidades/:id`: Obtener una entidad.
    * `PATCH /entidades/:id`: Actualizar una entidad.
* **Gestión de Usuarios (`/usuarios`)**:
    * `POST /usuarios`: Crear un nuevo usuario (para el sistema).
    * `GET /usuarios`: Listar usuarios.
    * `PATCH /usuarios/:id/asignar-rol`: Asignar roles (ej. 'Ventas', 'Admin').

---

### 📈 Módulo de Ventas (`/ventas`)

Flujo de "Pedido a Cobro" (Order-to-Cash).

* **Gestión de Pedidos de Venta (`/pedidos`)**:
    * `POST /pedidos`: Crear un nuevo pedido (estado 'BORRADOR').
    * `GET /pedidos`: Listar pedidos.
    * `GET /pedidos/:id`: Obtener un pedido con sus líneas.
    * `PATCH /pedidos/:id`: Actualizar líneas de un pedido (solo si está en 'BORRADOR').
    * `POST /pedidos/:id/confirmar`:
        * **Lógica Clave:** Cambia el estado a 'CONFIRMADO'.
        * **Dispara la lógica de inventario:** Llama a `InventarioService` para reservar stock y crear un `inventario_movimiento` de salida.
* **Gestión de Facturas de Venta (`/facturas`)**:
    * `POST /facturas`: Crear una factura (puede ser desde un pedido o independiente).
    * `GET /facturas`: Listar facturas.
    * `GET /facturas/:id`: Obtener una factura.
    * `POST /facturas/:id/emitir`: Cambia el estado a 'ENVIADA'.
    * `POST /facturas/:id/registrar-pago`: Cambia el estado a 'PAGADA' (lógica contable simple para el MVP).

---

### 📉 Módulo de Compras (`/compras`)

Flujo de "Compra a Pago" (Procure-to-Pay).

* **Gestión de Órdenes de Compra (`/ordenes-compra`)**:
    * `POST /ordenes-compra`: Crear una nueva orden de compra (estado 'BORRADOR').
    * `GET /ordenes-compra`: Listar órdenes.
    * `GET /ordenes-compra/:id`: Obtener una orden con sus líneas.
    * `POST /ordenes-compra/:id/confirmar`: Cambia el estado a 'CONFIRMADA'.
* **Recepción de Mercancía**:
    * `POST /ordenes-compra/:id/recibir`:
        * **Lógica Clave:** Registra la recepción de productos.
        * **Dispara la lógica de inventario:** Llama a `InventarioService` para crear un `inventario_movimiento` de entrada y actualizar `inventario_niveles_stock`.
* **Gestión de Facturas de Proveedor (`/facturas-proveedor`)**:
    * `POST /facturas-proveedor`: Registrar una factura de proveedor (contra una OC o directa).
    * `GET /facturas-proveedor`: Listar facturas por pagar.
    * `POST /facturas-proveedor/:id/registrar-pago`: Cambia el estado a 'PAGADA'.

---

### 🏭 Módulo de Inventario (`/inventario`)

Gestión centralizada del stock.

* **Gestión de Almacenes (`/almacenes`)**:
    * `POST /almacenes`: Crear un nuevo almacén.
    * `GET /almacenes`: Listar almacenes.
* **Consulta de Stock**:
    * `GET /stock/niveles`: Obtener el stock actual (`inventario_niveles_stock`).
    * `GET /stock/movimientos`: Obtener el historial de un producto (`inventario_movimientos`).
* **Lógica de Servicio (Interna)**:
    * `InventarioService.crearMovimiento(datosMovimiento)`:
        * Servicio *interno* (no expuesto como API) que será llamado por los módulos de Ventas y Compras.
        * **Lógica Transaccional (`@Transactional`)**:
            1.  Inserta en `inventario_movimientos`.
            2.  Actualiza (UPSERT) en `inventario_niveles_stock`.
            * Debe ser una transacción atómica: si falla la actualización de stock, falla la creación del movimiento.
* **Transferencias Internas (`/transferencias`)**:
    * `POST /transferencias`: Mover stock de `almacen_origen_id` a `almacen_destino_id`.
    * **Lógica:** Llama a `InventarioService.crearMovimiento` dos veces (una salida y una entrada).

---

## 4. Flujos de Proceso Clave (Lógica de Negocio)

El éxito del ERP depende de cómo se conectan los módulos.

### 🔄 Flujo 1: Proceso de Venta (Order-to-Cash)

1.  **Ventas**: `POST /ventas/pedidos/:id/confirmar`.
2.  **VentasService**: Inicia una transacción.
3.  **VentasService**: Actualiza `ventas_pedidos.estado` a 'CONFIRMADO'.
4.  **VentasService**: Itera sobre las `ventas_lineas_pedido`.
5.  **VentasService**: Llama a `InventarioService.crearMovimiento()` por cada línea:
    * `producto_id`: ID del producto.
    * `almacen_origen_id`: Almacén principal (definido en config).
    * `almacen_destino_id`: `NULL` (es una salida).
    * `cantidad`: Cantidad vendida.
    * `id_documento_origen`: ID del `ventas_pedidos`.
6.  **InventarioService**: (Dentro de su propia transacción anidada):
    * Inserta en `inventario_movimientos`.
    * Actualiza `inventario_niveles_stock` (restando la cantidad).
7.  **VentasService**: Finaliza la transacción. Si `InventarioService` falla (ej. no hay stock), se revierte todo el pedido.

### 🔄 Flujo 2: Proceso de Compra (Procure-to-Pay)

1.  **Compras**: `POST /compras/ordenes-compra/:id/recibir`.
2.  **ComprasService**: Inicia una transacción.
3.  **ComprasService**: Actualiza `compras_ordenes.estado` a 'RECIBIDA'.
4.  **ComprasService**: Itera sobre las `compras_lineas_orden`.
5.  **ComprasService**: Llama a `InventarioService.crearMovimiento()` por cada línea:
    * `producto_id`: ID del producto.
    * `almacen_origen_id`: `NULL` (es una entrada).
    * `almacen_destino_id`: Almacén de recepción.
    * `cantidad`: Cantidad recibida.
    * `id_documento_origen`: ID de la `compras_ordenes`.
6.  **InventarioService**: (Transacción anidada):
    * Inserta en `inventario_movimientos`.
    * Actualiza `inventario_niveles_stock` (sumando la cantidad).
7.  **ComprasService**: Finaliza la transacción.

---

## 5. Próximos Pasos (Roadmap de Desarrollo)

1.  **Sprint 1: Fundación y Núcleo**
    * Configurar el proyecto, NestJS, TypeORM, `.env`.
    * Implementar Módulo `Auth` (Login con JWT, Guards).
    * Implementar Módulo `Nucleo` (CRUD de Productos y Entidades).
    * Definir todas las entidades de TypeORM.
    * Usar `synchronize: true` para desarrollo inicial.
2.  **Sprint 2: Inventario y Compras**
    * Implementar Módulo `Inventario` (CRUD Almacenes, servicios de stock y movimientos).
    * Implementar Módulo `Compras` (CRUD Órdenes).
    * Implementar el **Flujo de Proceso 2 (Procure-to-Pay)** conectando Compras con Inventario.
3.  **Sprint 3: Ventas y Cierre**
    * Implementar Módulo `Ventas` (CRUD Pedidos).
    * Implementar el **Flujo de Proceso 1 (Order-to-Cash)** conectando Ventas con Inventario.
    * Implementar la lógica de Facturación (Ventas y Compras).
4.  **Sprint 4: Producción**
    * Desactivar `synchronize: true`.
    * Implementar **Migraciones** de TypeORM para gestionar el esquema de BD en producción.
    * Configurar logging y manejo de errores.
    * Desplegar (ej. Docker, Digital Ocean).