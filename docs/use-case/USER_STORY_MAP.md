# User Story Map — Paltazo

> **Qué es este documento:** User Story Map (Jeff Patton) del producto Paltazo.
> Organiza las historias de usuario en una estructura 2D:
> - **Eje horizontal (backbone):** actividades → tareas (la narrativa del usuario).
> - **Eje vertical:** historias priorizadas por release (slices).
>
> **Cómo usarlo junto a los casos de uso:** este documento da la **visión de conjunto** (qué hace el usuario y por qué). Los archivos `auth/auth.md`, `expenses/expenses.md`, `dashboard/dashboard.md` y `settings/settings.md` dan el **detalle de implementación** (flujos, validaciones, UI/UX). Cada historia referencia el CU correspondiente.

---

## 1. Mapa visual (backbone)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                           ACTIVIDADES (backbone)                                   │
├──────────────────┬──────────────────────┬────────────────────┬─────────────────────┤
│ A. ACCEDER A LA  │ B. REGISTRAR GASTOS  │ C. CONSULTAR ESTADO│ D. CONFIGURAR       │
│    APLICACIÓN    │                      │    DEL MES         │    PRESUPUESTO      │
├──────────────────┼──────────────────────┼────────────────────┼─────────────────────┤
│ • Crear cuenta   │ • Crear gasto rápido │ • Ver resumen      │ • Definir límite    │
│ • Iniciar sesión │ • Listar gastos      │   mensual          │   por moneda        │
│ • Recuperar      │ • Editar gasto       │ • Ver actividad    │ • Consultar info    │
│   contraseña     │ • Eliminar gasto     │   reciente         │   de la app         │
│ • Cerrar sesión  │                      │ • Recibir alertas  │ • Cerrar sesión     │
│ • Proteger rutas │                      │   de umbral        │                     │
└──────────────────┴──────────────────────┴────────────────────┴─────────────────────┘

        ▼ RELEASES (slices horizontales, de arriba hacia abajo) ▼

┌────────────────────────────────────────────────────────────────────────────────────┐
│ RELEASE 1 — MVP (v1.0): loop mínimo "registrar → ver presupuesto → alertar"        │
├────────────────────────────────────────────────────────────────────────────────────┤
│ [US-001] [US-002] [US-004] [US-005] [US-007] [US-008] [US-011] [US-013] [US-014] │
└────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────┐
│ RELEASE 2 — v1.1 ACTUAL: multi-moneda, presets, gráficos, edición inline           │
├────────────────────────────────────────────────────────────────────────────────────┤
│ [US-003] [US-006] [US-009] [US-010] [US-012] [US-015] [US-016]                    │
└────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────┐
│ RELEASE 3 — v1.2 FUTURO: OAuth social, offline-first real, notificaciones push     │
├────────────────────────────────────────────────────────────────────────────────────┤
│ [US-017] [US-018] [US-019]                                                         │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Actividad A — Acceder a la aplicación

> **Objetivo:** que el usuario entre de forma segura y sus datos estén aislados.

### Tarea A1 — Crear cuenta

#### US-001: Registro básico
**Como** persona que quiere controlar sus gastos, **quiero** crear una cuenta con email y contraseña **para** que mis datos financieros estén protegidos y sincronizados.

**Criterios de aceptación:**
- [ ] Acepta email con formato válido.
- [ ] Contraseña mínima de 6 caracteres (validada en cliente y servidor).
- [ ] Nombre completo es opcional (max 200 chars).
- [ ] Tras el registro se crea automáticamente un registro en `profiles` y un `budgets` default (S/ 1000).
- [ ] Si el email ya existe → mensaje inline "Este email ya está registrado".
- [ ] Si requiere confirmación de email → mensaje "Revisa tu correo para confirmar tu cuenta".

**Ref:** [`CU-002`](auth/auth.md#cu-002-registro-crear-cuenta) · **Release:** MVP

---

### Tarea A2 — Iniciar sesión

#### US-002: Login con credenciales
**Como** usuario registrado, **quiero** iniciar sesión con email y contraseña **para** acceder a mis gastos y presupuesto.

**Criterios de aceptación:**
- [ ] Credenciales válidas → redirige a `/dashboard`.
- [ ] Credenciales inválidas → mensaje inline "Email o contraseña incorrectos".
- [ ] Cuenta no confirmada → mensaje "Confirma tu correo antes de iniciar sesión".
- [ ] Botón deshabilitado mientras `loading = true`.

**Ref:** [`CU-001`](auth/auth.md#cu-001-login-inicio-de-sesión) · **Release:** MVP

---

### Tarea A3 — Recuperar contraseña

#### US-003: Flujo de recuperación
**Como** usuario que olvidó su contraseña, **quiero** solicitar un enlace de recuperación por email **para** restablecer mi acceso sin perder mis datos.

**Criterios de aceptación:**
- [ ] Solicita email y envía enlace de recuperación.
- [ ] No revela si el email existe (seguridad).
- [ ] Enlace contiene token con expiración (24h default).
- [ ] Token válido → muestra formulario de nueva contraseña.
- [ ] Nueva contraseña y confirmación deben coincidir (≥ 6 chars).
- [ ] Token inválido/expirado → mensaje inline con opción de solicitar nuevo enlace.

**Ref:** [`CU-003`](auth/auth.md#cu-003-recuperar-contraseña-solicitar-enlace), [`CU-004`](auth/auth.md#cu-004-nueva-contraseña-reset-con-token) · **Release:** MVP

---

### Tarea A4 — Cerrar sesión

#### US-004: Logout global
**Como** usuario logueado, **quiero** cerrar sesión desde cualquier parte de la app **para** proteger mi información al terminar de usarla.

**Criterios de aceptación:**
- [ ] Invalida todas las sesiones del usuario en todos los dispositivos (`scope: global`).
- [ ] Limpia estado global (`userId = null`, `expenses = []`).
- [ ] Redirige a `/onboarding`.
- [ ] Botón accesible desde Sidebar y desde Settings.

**Ref:** [`CU-005`](auth/auth.md#cu-005-logout-cerrar-sesión), [`CU-017`](settings/settings.md#cu-017-cerrar-sesión-desde-ajustes) · **Release:** MVP

---

### Tarea A5 — Proteger rutas

#### US-005: Middleware de autenticación
**Como** sistema, **quiero** validar la sesión en cada request **para** que ningún usuario no autenticado acceda a datos protegidos.

**Criterios de aceptación:**
- [ ] Rutas públicas: `/login`, `/onboarding`.
- [ ] Usuario no logueado en ruta protegida → redirige a `/login`.
- [ ] Usuario logueado en `/login` → redirige a `/`.
- [ ] No hay flash de ruta protegida antes de la redirección.

**Ref:** [`CU-006`](auth/auth.md#cu-006-protección-de-rutas-middleware) · **Release:** MVP

---

### Tarea A6 — Login social (futuro)

#### US-017: Google OAuth
**Como** usuario con cuenta Google, **quiero** iniciar sesión con un solo clic **para** evitar recordar otra contraseña.

**Criterios de aceptación:**
- [ ] Botón "Continuar con Google" en pantalla de login.
- [ ] Flujo OAuth completo con callback `/auth/callback`.
- [ ] Usuario nuevo → crea `profiles` y `budgets` automáticamente.

**Ref:** [`CU-007`](auth/auth.md#cu-007-google-oauth-login-social) · **Release:** v1.2 · **Shortcut:** botón visible pero no funcional aún.

---

## 3. Actividad B — Registrar gastos

> **Objetivo:** registrar un gasto en menos de 15 segundos, incluso sin conexión.

### Tarea B1 — Crear gasto rápido

#### US-006: Crear gasto con presets y multi-moneda
**Como** usuario, **quiero** registrar un gasto eligiendo monto, categoría, moneda y fecha **para** que quede reflejado en mi presupuesto del mes.

**Criterios de aceptación:**
- [ ] Monto: teclado numérico decimal, formato `X.XX`, max 9 dígitos enteros.
- [ ] Presets rápidos: `15.00 / 30.00 / 50.00 / 100.00` (en la moneda seleccionada).
- [ ] Monedas disponibles: `S/` y `$` (toggle superior).
- [ ] Categoría default: `food`; 5 opciones con icono (comida, transporte, servicios, ocio, otros).
- [ ] Descripción opcional (max ~200 chars).
- [ ] Fecha default: hoy; editable con picker nativo.
- [ ] Botón "Guardar" deshabilitado si `monto ≤ 0`.
- [ ] Tras guardar → toast "✓ Gasto registrado" (2s), formulario se limpia, moneda vuelve a la inicial.
- [ ] Si el usuario intenta salir con cambios sin guardar → modal "¿Descartar cambios?".

**Ref:** [`CU-008`](expenses/expenses.md#cu-008-crear-gasto) · **Release:** v1.1
**MVP anterior:** existía versión sin presets ni multi-moneda.

---

### Tarea B2 — Listar gastos del mes

#### US-007: Historial agrupado por fecha
**Como** usuario, **quiero** ver todos mis gastos del mes agrupados por fecha **para** saber en qué día gasté más.

**Criterios de aceptación:**
- [ ] Listado ordenado por fecha descendente.
- [ ] Vista desktop: tabla con columnas Fecha · Categoría · Descripción · Monto · Acciones.
- [ ] Vista mobile: cards agrupadas por fecha, cada grupo muestra subtotal en moneda principal.
- [ ] Header muestra total de registros y total gastado vs. límite.
- [ ] Si no hay gastos → estado vacío con CTA "+ Agregar primer gasto".

**Ref:** [`CU-009`](expenses/expenses.md#cu-009-listar-gastos-del-mes) · **Release:** MVP

---

### Tarea B3 — Editar gasto

#### US-008: Edición inline
**Como** usuario, **quiero** corregir un gasto que registré mal **para** que mi presupuesto refleje la realidad.

**Criterios de aceptación:**
- [ ] Edición inline (no modal, no página nueva).
- [ ] Campos editables: monto, descripción, categoría, fecha.
- [ ] Moneda **no** editable (el gasto mantiene su moneda original).
- [ ] Guardar deshabilitado si `monto ≤ 0`.
- [ ] Cancelar → vuelve a modo lectura sin persistir.

**Ref:** [`CU-010`](expenses/expenses.md#cu-010-editar-gasto) · **Release:** v1.1

---

### Tarea B4 — Eliminar gasto

#### US-009: Eliminación con confirmación
**Como** usuario, **quiero** eliminar un gasto que registré por error **para** que no afecte mi presupuesto.

**Criterios de aceptación:**
- [ ] Modal de confirmación obligatorio (convención global).
- [ ] Título "¿Eliminar gasto?" + mensaje "Esta acción no se puede deshacer."
- [ ] Botones "Cancelar" / "Eliminar".
- [ ] Tras eliminar → lista actualizada, totales recalculados.

**Ref:** [`CU-011`](expenses/expenses.md#cu-011-eliminar-gasto) · **Release:** MVP

---

## 4. Actividad C — Consultar estado del mes

> **Objetivo:** responder en una mirada la pregunta del producto: *¿cuánto he gastado y cuánto me queda?*

### Tarea C1 — Ver resumen mensual

#### US-010: Dashboard multi-moneda con días restantes
**Como** usuario, **quiero** ver en el dashboard el presupuesto, gastado, restante y porcentaje por cada moneda que uso **para** tener claridad inmediata de mi situación.

**Criterios de aceptación:**
- [ ] Una sub-card por moneda con: límite, barra de progreso, gastado, restante, %.
- [ ] Moneda principal del usuario aparece primero.
- [ ] Badge con días restantes del mes.
- [ ] Card superior con mensaje contextual ("Has gastado el X%...", "Ritmo moderado", etc.).
- [ ] Si `monthlyLimit = 0` → muestra "Sin límite" sin barra de progreso.

**Ref:** [`CU-012`](dashboard/dashboard.md#cu-012-visualizar-dashboard-mensual) · **Release:** v1.1
**MVP anterior:** dashboard con moneda única.

---

### Tarea C2 — Ver actividad reciente

#### US-011: Gráfico de barras de los últimos 7 días
**Como** usuario, **quiero** ver un gráfico de los últimos 7 días con la cantidad de gastos por día **para** identificar patrones de gasto diario.

**Criterios de aceptación:**
- [ ] 7 barras (hoy inclusive) con altura proporcional al count.
- [ ] Cada barra muestra: nombre del día (D/L/M/X/J/V/S), número, y count si hay gastos.
- [ ] Al tocar una barra → lista inferior muestra los gastos de ese día.
- [ ] Barra seleccionada en `bg-primary`; hoy en `bg-secondary`.
- [ ] Si un día no tiene gastos → altura mínima, color neutro.

**Ref:** [`CU-014`](dashboard/dashboard.md#cu-014-consultar-actividad-de-los-últimos-7-días) · **Release:** v1.1

---

### Tarea C3 — Recibir alertas de umbral

#### US-012: Alertas visuales en 80% / 100% / >100%
**Como** usuario, **quiero** que la app me avise visualmente cuando me acerque o supere mi presupuesto **para** evitar el "paltazo".

**Criterios de aceptación:**
- [ ] `≥ 80%` → nivel `warning` (amarillo), mensaje "Ritmo de gasto moderado".
- [ ] `≥ 100%` → nivel `critical` (rojo), mensaje "Alcanzaste tu límite".
- [ ] `> 100%` → nivel `exceeded` (rojo intenso), mensaje "Has superado tu presupuesto".
- [ ] Barra de progreso cambia de color según el nivel.
- [ ] Si `≥ 80%` y hay días restantes → sugiere gasto diario recomendado (`remaining / daysRemaining`).
- [ ] Cada moneda evalúa su propio nivel independientemente.

**Ref:** [`CU-013`](dashboard/dashboard.md#cu-013-alertas-de-umbral-80--100--100) · **Release:** MVP

**⚠️ Shortcut:** alertas reactivas (recalculadas en render), no idempotentes con banderas. Si el saldo oscila cruzando el umbral, la alerta se re-muestra.

---

## 5. Actividad D — Configurar presupuesto

> **Objetivo:** que el usuario defina su límite mensual y lo ajuste cuando cambie su situación.

### Tarea D1 — Definir límite por moneda

#### US-013: Presupuesto independiente por moneda
**Como** usuario que maneja más de una moneda, **quiero** configurar un límite mensual distinto para cada una **para** que el dashboard evalúe cada presupuesto por separado.

**Criterios de aceptación:**
- [ ] Sección "💰 Presupuestos por moneda" con un bloque por moneda (`S/`, `$`).
- [ ] Input numérico con símbolo de moneda a la izquierda (`step="0.01"`).
- [ ] Botón "Guardar" deshabilitado si valor vacío o `≤ 0`.
- [ ] Tras guardar → botón muestra "✓" por 2s como feedback.
- [ ] Badge "Principal" en la moneda default del usuario.
- [ ] Badge "Configurado" en monedas con límite ya definido.

**Ref:** [`CU-015`](settings/settings.md#cu-015-configurar-presupuesto-por-moneda) · **Release:** v1.1
**MVP anterior:** presupuesto único en moneda principal.

---

### Tarea D2 — Consultar info de la app

#### US-014: Información de la app y niveles de alerta
**Como** usuario, **quiero** ver la versión de la app y los umbrales de alerta **para** entender cómo funciona el sistema.

**Criterios de aceptación:**
- [ ] Sección "🌿 Acerca de Paltazo" con versión, tipo ("App web progresiva") y almacenamiento ("Supabase").
- [ ] Sección "📊 Niveles de alerta" con dots de color: 🟡 80% / 🔴 100% / 🔴 101%.
- [ ] Solo lectura, no editable.

**Ref:** [`CU-016`](settings/settings.md#cu-016-consultar-información-de-la-app) · **Release:** v1.1

---

### Tarea D3 — Cerrar sesión

#### US-015: Logout desde settings
**Como** usuario, **quiero** cerrar sesión desde la pantalla de ajustes **para** salir de forma rápida al terminar.

**Criterios de aceptación:**
- [ ] Botón "Cerrar sesión" en la parte inferior de Settings.
- [ ] Ejecuta `store.logout()` con `scope: global`.
- [ ] Redirige a `/onboarding`.
- [ ] Sin modal de confirmación (acción reversible).

**Ref:** [`CU-017`](settings/settings.md#cu-017-cerrar-sesión-desde-ajustes), [`CU-005`](auth/auth.md#cu-005-logout-cerrar-sesión) · **Release:** MVP

---

## 6. Historias futuras (Release v1.2)

### US-016: Google OAuth (login social)
**Como** usuario con cuenta Google, **quiero** iniciar sesión con un solo clic **para** evitar recordar otra contraseña.
**Ref:** [`CU-007`](auth/auth.md#cu-007-google-oauth-login-social) · **Status:** shortcut (botón visible, no funcional)

### US-017: Offline-first con cola de sync
**Como** usuario en el metro sin señal, **quiero** registrar gastos sin conexión y que se sincronicen al volver la red **para** no perder el registro.
**Status:** store mantiene estado optimista, pero no hay cola de sync persistente ni indicador visual de "X cambios pendientes".

### US-018: Notificaciones push
**Como** usuario, **quiero** recibir una notificación push al cruzar un umbral **para** enterarme aunque no tenga la app abierta.
**Status:** no implementado; alertas son solo visuales en el dashboard.

---

## 7. Tabla resumen de trazabilidad

| Historia | Actividad | Tarea | Release | Ref CU | Estado |
|----------|-----------|-------|---------|--------|--------|
| US-001 | A | A1 Crear cuenta | MVP | CU-002 | ✅ |
| US-002 | A | A2 Iniciar sesión | MVP | CU-001 | ✅ |
| US-003 | A | A3 Recuperar contraseña | MVP | CU-003, CU-004 | ✅ |
| US-004 | A | A4 Cerrar sesión | MVP | CU-005, CU-017 | ✅ |
| US-005 | A | A5 Proteger rutas | MVP | CU-006 | ✅ |
| US-006 | B | B1 Crear gasto rápido | v1.1 | CU-008 | ✅ |
| US-007 | B | B2 Listar gastos | MVP | CU-009 | ✅ |
| US-008 | B | B3 Editar gasto | v1.1 | CU-010 | ✅ |
| US-009 | B | B4 Eliminar gasto | MVP | CU-011 | ✅ |
| US-010 | C | C1 Ver resumen mensual | v1.1 | CU-012 | ✅ |
| US-011 | C | C2 Ver actividad reciente | v1.1 | CU-014 | ✅ |
| US-012 | C | C3 Alertas de umbral | MVP | CU-013 | ⚠️ shortcut |
| US-013 | D | D1 Presupuesto por moneda | v1.1 | CU-015 | ✅ |
| US-014 | D | D2 Info de la app | v1.1 | CU-016 | ✅ |
| US-015 | D | D3 Cerrar sesión (settings) | MVP | CU-017, CU-005 | ✅ |
| US-016 | A | A6 Login social | v1.2 | CU-007 | 🔜 shortcut |
| US-017 | B | B1 Offline-first | v1.2 | — | 🔜 pendiente |
| US-018 | C | C3 Push notifications | v1.2 | — | 🔜 pendiente |

**Total:** 18 historias · 15 implementadas · 3 futuras (v1.2).
