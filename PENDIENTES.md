# Pendientes — Paltazo

> **Fecha:** 03 nov 2026 (actualizado tras mejoras visuales de colores ingresos/gastos)
> **Alcance:** todo lo que falta para que la app cumpla su documentación funcional.
> **Fuentes de verdad:** `docs/use-case/` · `docs/architecture/ARCHITECTURE_SPEC.md` · `CHECKPOINT_2026_10_29.md`
> **Convención:** `🔴` bloquea el uso de la app · `🟡` bloquea el cumplimiento de un CU · `🟢` cosmético/documental

---

## 0. Resumen ejecutivo

| Área | Pendientes | Estado |
|------|-------------|--------|
| A. Código — bugs y brechas | 0 | ✅ Todos resueltos |
| B. Implementación de CUs propuestos | 6 CUs | Especificados, 0 implementados |
| C. Decisiones de producto | 6 | Ninguna bloqueante el código actual |
| D. Documentación y herramientas | 3 | 1 desactualizado |

**Estado de los 27 CUs:** 20 implementados · 1 auxiliar implementado (CU-018) · 2 futuros v1.2 (CU-019, CU-020) · 6 propuestos sin implementar (CU-021 a CU-026).

**Últimos cambios (03 nov 2026):**
- ✅ Colores globales aplicados: ingresos en verde, gastos en rojo en toda la app
- ✅ Layout mejorado en "Saldo disponible" del dashboard
- ✅ `emerald` agregado al tema Tailwind

**Lo que sigue:** implementar los 6 CUs propuestos (categorías, setup, ingresos).

---

## A. Código — bugs y brechas entre documentación e implementación

### ✅ A1 a A7 — Todos resueltos

| ID | Issue | Estado | Fix aplicado |
|----|-------|--------|--------------|
| A1 | Logout ignora errores de Supabase | ✅ | `store.logout()` captura error, no limpia estado si falla |
| A2 | Falta pantalla `/session-closed` | ✅ | Creada `src/app/session-closed/page.tsx` |
| A3 | BUG-001: nivel `exceeded` inalcanzable | ✅ | Eliminado `Math.min(..., 100)` del cálculo |
| A4 | Categorías hardcodeadas | ✅ | Tabla `categories` con RLS, FK en `expenses` |
| A5 | Trigger crea presupuesto por defecto | ✅ | Trigger solo crea `profiles` + categorías default |
| A6 | Falta flujo `/setup` | ✅ | Pantalla `setup/page.tsx` + `OnboardingGuard` |
| A7 | Discrepancias menores doc↔código | ✅ | Alineadas |

**Mejoras visuales (03 nov 2026):**
- Ingresos en verde (`text-emerald`, `#2E7D32`), gastos en rojo (`text-danger`, `#EF4444`) en toda la app
- Layout mejorado en "Saldo disponible" del dashboard
- `emerald` agregado al tema Tailwind

---

## B. Implementación de CUs propuestos (CU-021 a CU-026)

> Especificación completa en `docs/use-case/`. Diseño técnico ya resuelto en `docs/architecture/ARCHITECTURE_SPEC.md`.
> **Ningún CU de esta sección está implementado.** El plan de fases está en `ARCHITECTURE_SPEC.md` §5.

### B1. CU-021 — Moneda principal y presupuesto en el primer ingreso
Spec: `docs/use-case/onboarding/onboarding.md`
- [ ] Migración: `profiles.primary_currency` + `profiles.has_completed_onboarding`
- [ ] Trigger deja de crear presupuesto y moneda por defecto
- [ ] Pantalla `/setup` con selector S/ $ € y monto
- [ ] Redirect en middleware si `has_completed_onboarding = false`
- [ ] Sin acceso al dashboard hasta completar

### B2. CU-022 — Agregar moneda
Spec: `docs/use-case/settings/settings.md`
- [ ] Selector de monedas no activas
- [ ] Persistencia de monedas activas del usuario
- [ ] Integrar con selectores de gasto (CU-008) y presupuestos (CU-015)
- [ ] Agregar moneda **no** crea presupuesto automático

### B3. CU-023 — Quitar moneda
Spec: `docs/use-case/settings/settings.md`
- [ ] Solo secundarias (la principal no se puede quitar)
- [ ] Modal de confirmación con el **número de gastos** afectados
- [ ] Borrado atómico de `expenses` + `budgets` de esa moneda
- [ ] **Irreversible** — el modal debe advertirlo

### B4. CU-024 — Crear categoría
Spec: `docs/use-case/categories/categories.md`
- [ ] Migración: tabla `categories` con RLS
- [ ] `expenses.category` → `category_id` FK; eliminar el `CHECK`
- [ ] Migrar datos existentes a las 5 categorías por defecto
- [ ] Formulario: nombre (máx. 30, único case-insensitive), icono y color de catálogos cerrados
- [ ] Botón `+ Nueva categoría` en el selector de gasto

### B5. CU-025 — Editar categoría
Spec: `docs/use-case/categories/categories.md`
- [ ] Editar nombre, icono y color (incluidas las 5 por defecto)
- [ ] "Otros" no es editable
- [ ] Sin `is_protected` → sin botón de edición/edición bloqueada
- [ ] Los gastos asociados reflejan el cambio sin modificarse

### B6. CU-026 — Eliminar categoría
Spec: `docs/use-case/categories/categories.md`
- [ ] Modal con el **número de gastos** que pasarán a "Otros"
- [ ] Reasignación + borrado en transacción atómica
- [ ] "Otros" no se puede eliminar
- [ ] La reasignación conserva monto, fecha, moneda y descripción

---

## C. Decisiones de producto abiertas

> Ninguna bloquea el código actual. Se resuelven cuando toque implementar el área afectada.

| # | Decisión | Dónde | Notas |
|---|----------|-------|-------|
| C1 | ¿"dashboard" o "home" para la ruta `/`? | `auth.md` §Decisiones pendientes 1 | Tangencial; no bloquea |
| C2 | Fecha de activación del login con Google (CU-007) | `auth.md` CU-007 | El botón sigue como shortcut |
| C3 | Alcance del rol `admin` | `auth.md` §Decisiones pendientes 3 | Fuera del MVP; abriría un inventario nuevo de CUs |
| C4 | ¿El trigger tolerante a fallos se acepta o se endurece? | `auth.md` §Decisiones pendientes 5 | Con CU-021 aplica solo a `profiles` |
| C5 | Resolver BUG-001: quitar el cap de 100% o borrar `exceeded` de la doc | `dashboard.md` CU-013 | La spec de archify ya recomienda quitar el cap |
| C6 | Asignar release a CU-021 a CU-026 | `USER_STORY_MAP.md` §7 | Hoy: "Propuesta", sin release |

---

## D. Documentación y herramientas

### D1. 🟢 `HANDOFF_AUTH_REVIEW.md` desactualizado

Se generó antes de las decisiones del 29 oct. Contradice lo ya resuelto:

| Sección | Qué dice | Realidad |
|---------|----------|----------|
| §6 | "Pantalla Sesión cerrada: crear `/session-closed` o ajustar doc" | ✅ Decidido: `/session-closed` |
| §6 | "Pantalla Revisa tu correo: crear o mantener inline" | ✅ Decidido: feedback inline, sin trabajo pendiente |
| §7.1 | "Catálogo exacto de emojis y paleta pendiente" | ✅ Definido en `categories.md` (16 emojis, 8 colores) |
| §7.2 | "Ubicación de gestión de categorías pendiente" | ✅ Definido: panel en `/dashboard/settings` + acceso `+ Nueva categoría` |
| §7.5 | "Resolver BUG-001 y las pantallas post-logout/post-recuperación" | Parcialmente resuelto: solo BUG-001 sigue abierto |

**Acción:** actualizar el checkpoint o marcarlo como sustituido por este archivo.

### D2. 🟢 Grafo de Graphify desactualizado

`graphify-out/` refleja la documentación previa a la unificación de hoy. Los `ast_hash` de `auth.md`, `settings.md`, `expenses.md`, `USER_STORY_MAP.md` y `categories.md` quedaron desfasados.

**Acción:** en la terminal del repo →
```
graphify update .
```
Si no está en el PATH: `& "$env:USERPROFILE\.local\bin\graphify.exe" update .`

**Riesgo si se omite:** ninguno funcional. Las consultas al grafo sobre estos archivos devolverán líneas de heading desfasadas; la próxima corrida detecta los cambios por hash y reindexa solo lo que cambió.

### D3. 🟢 MCP de Graphify no registrado en OpenCode

`~/.local/bin/graphify.exe` y `graphify-mcp.exe` están instalados, pero el MCP no está en la config de OpenCode. Por eso `graphify query` / `explain` / `path` no están disponibles en las sesiones, y `AGENTS.md` pide consultarlos antes de explorar el repo.

**Acción (opcional):** agregar a `~/.config/opencode/config.json`:
```json
"mcp": {
  "graphify": {
    "type": "local",
    "command": ["C:\\Users\\Peter Zegarra\\.local\\bin\\graphify-mcp.exe"],
    "enabled": true
  }
}
```

### D4. 🟢 Canvas de casos de uso

`docs/use-case/RED_CASOS_DE_USO.canvas` — 56 nodos, 68 conexiones. Los anchors siguen válidos (no se renombraron títulos de CU), pero es una vista manual: si cambian IDs o relaciones, hay que actualizarlo a mano.

### D5. 🟢 Sin tests automatizados

No hay runner ni script de test en `package.json`. AGENTS.md exige prueba unitaria para lógica no trivial (umbrales de alerta, validación de nombres, cálculos). A considerar al implementar CU-021 a CU-026.

---

## E. Orden de ejecución sugerido

```
1. A1 + A2  →  Arregla el logout (P0). Es lo único que hoy rompe una garantía
                de seguridad documentada. 3 archivos + 1 ruta nueva.
2. D2      →  graphify update . (desbloquea consultas al grafo)
3. A3      →  BUG-001 (1 línea, cierra una decisión de producto)
4. B4 + B5 + B6  →  Categorías (tabla categories + CRUD). Es el bloque más grande
                     y el que más valor da: desbloquea la personalización.
5. B1      →  /setup + trigger (moneda principal). Depende de que el trigger
                deje de crear presupuesto por defecto (A5 va aquí).
6. B2 + B3 →  Monedas a demanda.
7. A4 (parte de categories) →  Tipos y CURRENCY_OPTIONS dinámicos.
8. A7 + D1 + D3 + D5  →  Limpieza final: doc, tooling y tests.
```

**Notas de coordinación:**
- B4 (tabla `categories`) y B1 (`profiles`) tocan migraciones: no correrlas en paralelo sobre el mismo schema.
- A3 debería resolverse **antes** de B4: el nivel `exceeded` se vuelve alcanzable y las barras de progreso de categorías pueden exceder 100%.
- Al implementar cada CU: actualizar su estado en `docs/use-case/README.md` y `USER_STORY_MAP.md` §7, y reindexar con `graphify update .`.

---

## F. Referencia rápida de fuentes

| Documento | Contenido |
|-----------|-----------|
| `docs/use-case/README.md` | Índice de los 7 módulos y su estado |
| `docs/use-case/USER_STORY_MAP.md` | 21 historias, trazabilidad, releases |
| `docs/use-case/auth/auth.md` | CU-001 a CU-007 |
| `docs/use-case/expenses/expenses.md` | CU-008 a CU-011 |
| `docs/use-case/dashboard/dashboard.md` | CU-012 a CU-014 |
| `docs/use-case/settings/settings.md` | CU-015 a CU-017, CU-022, CU-023 |
| `docs/use-case/onboarding/onboarding.md` | CU-018, CU-021 |
| `docs/use-case/categories/categories.md` | CU-024 a CU-026 |
| `docs/use-case/future/future.md` | CU-019, CU-020 (v1.2) |
| `docs/architecture/ARCHITECTURE_SPEC.md` | ERD, componentes, 5 secuencias, plan de fases |
| `HANDOFF_AUTH_REVIEW.md` | Checkpoint del 29 oct (⚠️ desactualizado — ver D1) |
