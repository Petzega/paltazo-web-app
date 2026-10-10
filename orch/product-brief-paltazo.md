# PRODUCT BRIEF: Paltazo (PWA de Control de Gastos Personales)

> **Documento:** Especificación Funcional de Entrada para Orquestador Multi-Agente  
> **Destinatario Principal:** Agente Product Manager (PM) & Arquitecto de Software  
> **Enfoque de Ingeniería:** Regla 80/20 (Alcance delimitado, offline-first, arquitectura ejecutable en Sandbox)  
> **Versión:** 1.0 (MVP)

---

## 1. Visión General y Propuesta de Valor
* **Nombre del Producto:** Paltazo
* **Definición:** Progressive Web App (PWA) ligera, personal y de respuesta inmediata para registrar gastos diarios en tiempo real, visualizar el presupuesto mensual disponible y alertar al usuario antes de incurrir en sobregiros ("el paltazo").
* **Problema Central:** Las personas registran gastos tarde, de manera incompleta o dispersa (notas, chats, hojas de cálculo). Esto provoca la pérdida de visibilidad del saldo disponible y el descubrimiento tardío de límites presupuestarios excedidos.
* **Propuesta de Valor:** "Paltazo ayuda a detectar el 'paltazo' antes de que ocurra". Transforma cada micro-gasto cotidiano en una señal clara frente al presupuesto mensual, sin formularios complejos, sin publicidad ni fricción, y con funcionamiento garantizado aún sin conexión a Internet.

---

## 2. Perfil de Usuario y Escenarios de Uso
* **Usuario Objetivo:** Persona que administra sus finanzas personales cotidianas y necesita conocer en cualquier momento del mes: *¿cuánto he gastado y cuánto dinero me queda antes de alcanzar mi límite?*
* **Contexto Operativo:**
  * Registro de transacciones frecuentes y de bajo importe (comida, transporte, café, servicios, ocio).
  * Uso prioritario en dispositivos móviles mediante navegación táctil o PWA instalada, con soporte secundario en navegadores de escritorio.
  * Conectividad móvil intermitente (metro, sótanos, zonas sin cobertura). No debe bloquearse el flujo de guardado por falta de red.
  * Cero requerimiento de contabilidad avanzada o declaraciones tributarias; demanda de simplicidad y rapidez.

---

## 3. Delimitación Rigurosa del Alcance (Scope Boundaries)

### 3.1. Dentro del Alcance (In-Scope - Obligatorio para MVP)
* **Gestión de Gastos (CRUD Atómico):**
  * Creación ultrarrápida de gastos en menos de 15 segundos (campos obligatorios: monto y categoría; campos opcionales: descripción y fecha).
  * Categorías precargadas del sistema: `Comida`, `Transporte`, `Servicios`, `Ocio`, `Otros`.
  * Edición y eliminación de registros existentes dentro del mes en curso.
* **Configuración Presupuestaria:**
  * Definición de presupuesto mensual global (monto límite) y selección de moneda (ej. PEN, USD, EUR, etc.).
* **Dashboard Financiero en Tiempo Real:**
  * Indicadores inmediatos en pantalla principal: Presupuesto total, Gasto acumulado, Saldo restante y Porcentaje consumido.
  * Barra de progreso visual con codificación semántica de color según el porcentaje de consumo.
* **Motor de Alertas Preventivas:**
  * Notificaciones visuales y banners informativos al alcanzar umbrales clave:
    1. **80% del presupuesto:** Alerta preventiva (amarillo / precaución).
    2. **100% del presupuesto:** Alerta de límite alcanzado (naranja).
    3. **>100% del presupuesto:** Alerta crítica de sobregiro (rojo / "paltazo").
  * Disparo idempotente: La alerta se activa una sola vez al cruzar el umbral en el mes, evitando spam al registrar nuevos gastos.
* **Historial y Detalle Mensual:**
  * Listado cronológico inverso de transacciones del mes agrupadas por fecha.
* **Arquitectura Offline-First:**
  * Almacenamiento local de datos (IndexedDB / LocalStorage) que permite registrar gastos sin conexión.
  * Cola de sincronización (*Sync Queue*) que actualiza automáticamente los registros en el backend al restablecerse la red.
  * Indicador visual discreto de estado de sincronización (icono o badge de "Guardado local / Sincronizado").
* **Autenticación Simple y Aislamiento de Datos:**
  * Registro e inicio de sesión seguro (JWT / sesión simple por email y contraseña).
  * Aislamiento estricto por usuario (*Row-Level Isolation*): ningún usuario puede consultar ni alterar gastos ajenos.
* **Experiencia de Usuario PWA Responsive:**
  * Diseño adaptativo con el mismo sistema de diseño (Tailwind CSS) en móvil y escritorio.
  * Manifiesto PWA (`manifest.json`) y Service Worker básico para permitir instalación en pantalla de inicio y caché offline.

### 3.2. Fuera del Alcance (Out-of-Scope - Prohibido en esta fase para evitar sobreingeniería)
* Integración bancaria automática o lectura de estados de cuenta vía Open Banking.
* Sincronización con tarjetas de crédito, débito o billeteras digitales (Yape, Plin, Mercado Pago, etc.).
* Gestión de inversiones, préstamos, deudas, activos o patrimonio neto.
* Contabilidad empresarial, emisión de facturas o cálculos fiscales.
* Presupuestos compartidos, cuentas multifamiliares o múltiples usuarios por presupuesto.
* Presupuestos independientes por categoría (solo aplica presupuesto global mensual en MVP).
* Modelos predictivos de IA o recomendaciones generativas de ahorro dentro de la app.
* Empaquetado y publicación obligatoria en Google Play Store o Apple App Store (distribución 100% como PWA web).

---

## 4. Flujo Crítico de Usuario (Happy Path) y Casos Extremos

### 4.1. Flujo Principal de Registro (Happy Path)
1. El usuario abre la app (tiempo de carga inicial inferior a 1.5 segundos).
2. La pantalla principal muestra el estado actual del mes y un botón prominente de acción rápida (`+ Gasto`).
3. El usuario ingresa el monto numérico y selecciona una categoría con un solo toque (teclado numérico enfocado por defecto).
4. Opcionalmente añade una descripción corta o modifica la fecha (por defecto: fecha y hora actual).
5. Presiona "Guardar". La app almacena el dato de inmediato en el almacenamiento local en milisegundos y cierra el modal/formulario.
6. El Dashboard recalcula y anima el gasto acumulado y el saldo restante.
7. Si el nuevo total supera el 80% o 100%, se presenta la alerta preventiva contextual sin interrumpir el flujo.
8. En segundo plano, si hay conexión activa, se envía la mutación a la API REST.

### 4.2. Flujo Offline (Sin Conexión)
1. El dispositivo no tiene conexión a red.
2. El usuario ejecuta los pasos 2 a 5 sin advertir bloqueos ni spinners de carga infinitos.
3. El gasto se guarda en la base de datos local con estado `sync_status: 'pending'`.
4. El Dashboard se actualiza localmente reflejando el nuevo saldo.
5. Un indicador sutil muestra "1 cambio pendiente de sincronizar".
6. Al reconectarse el dispositivo (`window.addEventListener('online')`), el servicio cliente procesa la cola de sincronización contra el endpoint `/api/sync/expenses` y actualiza el estado a `sync_status: 'synced'`.

---

## 5. Modelo Conceptual de Datos

```
+-------------------------------------------------------------+
|                         USUARIO                             |
+-------------------------------------------------------------+
| id: UUID (PK)                                               |
| email: VARCHAR(255) (UNIQUE)                                |
| password_hash: VARCHAR(255)                                 |
| created_at: TIMESTAMP                                       |
+------------------------------+------------------------------+
                               | 1
                               |
                               | 1..*
+------------------------------v------------------------------+
|                   PRESUPUESTO_MENSUAL                       |
+-------------------------------------------------------------+
| id: UUID (PK)                                               |
| usuario_id: UUID (FK -> Usuario.id)                         |
| anio: INTEGER (ej. 2026)                                    |
| mes: INTEGER (1 - 12)                                       |
| monto_limite: DECIMAL(10,2)                                 |
| moneda: VARCHAR(3) (ej. 'PEN', 'USD')                       |
| alerta_80_disparada: BOOLEAN (Default: False)               |
| alerta_100_disparada: BOOLEAN (Default: False)              |
| alerta_exceso_disparada: BOOLEAN (Default: False)           |
+------------------------------+------------------------------+
                               | 1
                               |
                               | 0..*
+------------------------------v------------------------------+
|                            GASTO                            |
+-------------------------------------------------------------+
| id: UUID (PK) (Generable en cliente v4 para offline)        |
| usuario_id: UUID (FK -> Usuario.id)                         |
| monto: DECIMAL(10,2)                                        |
| categoria: ENUM ('comida','transporte','servicios','ocio','otros')
| descripcion: VARCHAR(255) (Nullable)                        |
| fecha_gasto: DATE                                           |
| created_at: TIMESTAMP                                       |
| updated_at: TIMESTAMP                                       |
| is_deleted: BOOLEAN (Default: False - Soft delete para sync)|
+-------------------------------------------------------------+
```

---

## 6. Reglas de Negocio Atómicas
1. **Regla de Idempotencia de Alertas:**
   * Dado un presupuesto $P$ y un gasto acumulado $G = \sum \text{monto}$:
     * Si $G \ge 0.80 \times P$ y `alerta_80_disparada == False` $\rightarrow$ Activar Alerta 80% y marcar `True`.
     * Si $G \ge 1.00 \times P$ y `alerta_100_disparada == False` $\rightarrow$ Activar Alerta 100% y marcar `True`.
     * Si $G > 1.00 \times P$ y `alerta_exceso_disparada == False` $\rightarrow$ Activar Alerta Sobrepasado y marcar `True`.
   * Si un gasto es eliminado y $G$ desciende por debajo del umbral, las banderas no se resetean automáticamente para evitar notificaciones repetitivas en oscilaciones de saldo.
2. **Generación de Claves Primarias:**
   * Los identificadores de gasto deben ser UUIDv4 generados directamente en el cliente para permitir creaciones seguras en modo offline sin colisiones al sincronizar con el servidor.
3. **Manejo de Monedas:**
   * El sistema opera en una sola moneda activa por mes por usuario. No realiza conversión de tipos de cambio en este MVP.

---

## 7. Pila Tecnológica Recomendada (Sandbox-Friendly & Zero-Cost)
Para garantizar que el orquestador agéntico y sus agentes de programación (Desarrollador y QA) puedan compilar, ejecutar y verificar la aplicación de manera autónoma en microVMs aisladas (como E2B o Docker):

* **Backend:** Python 3.11+ con **FastAPI**.
  * Razón: Tipado estricto con Pydantic, generación nativa de documentación OpenAPI (`/docs`), ligero y arranque en milisegundos.
* **Base de Datos:** **SQLite** (con SQLAlchemy o SQLModel).
  * Razón: Cero latencia de conexión, sin dependencias de servicios externos pesados en el sandbox, fácilmente verificable en tests de integración.
* **Frontend:** PWA con **HTML5, TailwindCSS y JavaScript Moderno (Vanilla o Alpine.js / Vue 3 ligero)** servido directamente desde FastAPI o Vite.
  * Almacenamiento local mediante `IndexedDB` o wrapper liviano (como Dexie.js o LocalForage).
  * Service Worker con estrategia *Network-First falling back to Cache* para activos y *Cache-First* para la interfaz.
* **Pruebas Automatizadas:** **pytest** con `pytest-asyncio` y `httpx` (TestClient de FastAPI).

---

## 8. Criterios de Aceptación para QA Automatizado (SWE-bench Style)
El Agente de QA dará por aceptada la solución únicamente si los siguientes tests de integración pasan al 100% en la terminal del entorno de ejecución:

| Test ID | Escenario | Entrada / Acción | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| `TC-AUTH-01` | Registro y aislamiento | Crear Usuario A y Usuario B; Usuario A registra un gasto. | Usuario B consulta `/api/expenses` y recibe una lista vacía `[]`. |
| `TC-EXP-01` | Creación válida | `POST /api/expenses` con monto: 45.50, categoría: "comida". | HTTP 201 Created; registro persistido con UUID y fecha actual. |
| `TC-EXP-02` | Validación de datos | `POST /api/expenses` con monto negativo o categoría inválida. | HTTP 422 Unprocessable Entity con detalle del campo erróneo. |
| `TC-BUDG-01` | Recálculo de Dashboard | Presupuesto: 1000. Gastos registrados: 300 y 250. | `GET /api/dashboard` retorna `total_spent: 550.00`, `remaining: 450.00`, `percentage: 55.0%`. |
| `TC-ALERT-01` | Disparo de Umbral 80% | Presupuesto: 1000. Gasto acumulado pasa de 750 a 820. | El objeto del dashboard incluye `alert_triggered: "THRESHOLD_80"`. |
| `TC-SYNC-01` | Sincronización en lote | `POST /api/sync/expenses` enviando array de 3 gastos creados offline con UUIDs. | HTTP 200 OK; los 3 gastos se insertan sin duplicarse ni generar errores 500. |

---

## 9. Directivas de Ejecución para el Equipo Agéntico

1. **Al Agente Product Manager (PM):**
   * Transforma este documento en el PRD formal de ingeniería, detallando las Historias de Usuario en formato estándar (*"Como usuario quiero registrar un gasto en 2 clics para mantener al día mi presupuesto sin perder tiempo"*).
2. **Al Agente Arquitecto de Software:**
   * Diseña el esquema DDL de SQLite y el archivo de especificación OpenAPI (`openapi.yaml`).
   * Define la estructura de carpetas modular del repositorio (ej. `/app/api`, `/app/models`, `/app/static`, `/tests`).
3. **Al Agente Ingeniero Full-Stack:**
   * Implementa el backend con FastAPI, los endpoints REST de autenticación, gastos, presupuesto y sincronización, junto con la interfaz PWA con Tailwind CSS.
4. **Al Agente QA Tester:**
   * Escribe la suite completa `tests/test_paltazo.py` cubriendo los casos de prueba indicados y ejecútala en el sandbox mediante `pytest -v`. Corrije cualquier fallo antes de la entrega final.
