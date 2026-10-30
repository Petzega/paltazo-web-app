# Checkpoint: Paltazo — Documentación funcional y estado técnico

> **Fecha:** 29 oct 2026 · **Estado:** documentación funcional centralizada y consistente; implementación de lo nuevo pendiente.
> **Fuente de verdad funcional:** `docs/use-case/` (índice: `README.md`; vista navegable: `RED_CASOS_DE_USO.canvas`).
> **Convención:** todo lo marcado **PROPUESTO** está documentado y aprobado por producto, pero **NO implementado**. Lo marcado "código actual" describe el comportamiento real de hoy.
> **Cómo retomar:** leer este checkpoint → `docs/use-case/README.md` → el CU a implementar → el código referenciado. Consultar Graphify antes de explorar el repo.

> ⚠️ **Este checkpoint quedó parcialmente desactualizado** tras la unificación de contradicciones del 29 oct 2026.
> **Para la lista vigente de pendientes, ver [`PENDIENTES.md`](PENDIENTES.md).**
> Secciones de este documento que ya no reflejan el estado actual: **§6** (decisiones de UX de pantallas post-logout/post-recuperación), **§7.1** (catálogo de emojis y paleta) y **§7.2** (ubicación de la gestión de categorías) — los tres están resueltos. **§7.5** solo conserva pendiente BUG-001.

---

## 1. Estado en una mirada

| Métrica | Valor |
|---------|-------|
| Casos de uso totales | **26** (CU-001 a CU-026) |
| Implementados | **17** (CU-001 a CU-017) |
| Auxiliar implementado | **1** (CU-018 onboarding) |
| Futuros v1.2 | **2** (CU-019 offline-first, CU-020 push) |
| Propuestos sin implementar | **6** (CU-021 a CU-026) |
| Historias de usuario | **21** (15 implementadas, 3 futuras, 3 propuestas) |
| Módulos documentados | **7** (auth, expenses, dashboard, settings, onboarding, categories, future) |
| Tests automatizados | **0** (no hay runner ni script de test) |

Documentación **centralizada**: `docs/use-case/` es la única fuente de verdad funcional. El Canvas es una vista, no una fuente: si cambian los CUs, hay que actualizarlo manualmente.

---

## 2. Qué se completó en esta sesión (29 oct 2026)

- **Auditoría documentación vs código:** se identificaron contradicciones en monedas (solo S/ y $ fijas), categorías (5 hardcodeadas, sin personalización), consola de logout y BUG-001.
- **Nuevos requisitos de producto definidos y aprobados:** moneda y presupuesto en el primer ingreso; monedas S/, $ y € a demanda; categorías personalizables con icono y color.
- **6 CUs nuevos redactados con la skill `use-case-writer`** (4 fases: diagnóstico, inventario, borradores, edición), con las decisiones de negocio cerradas por el usuario.
- **Nuevo módulo `docs/use-case/categories/categories.md`** y 3 historias nuevas (US-019 a US-021).
- **CUs existentes alineados** para no contradecir lo nuevo: CU-002 (registro), CU-008 (crear gasto) y CU-015 (presupuesto por moneda).
- **Canvas de Obsidian** creado y ampliado: 56 nodos, 68 conexiones, 54 enlaces validados.
- **Handoff anterior convertido en este checkpoint**; las decisiones históricas reemplazadas quedaron marcadas como tales.

---

## 3. Documentación por módulo

| Módulo | Archivo | CUs | Estado |
|--------|---------|-----|--------|
| Autenticación | `docs/use-case/auth/auth.md` | CU-001 a CU-007 | ✅ Implementado; CU-002 actualizado con impacto de CU-021 |
| Gastos | `docs/use-case/expenses/expenses.md` | CU-008 a CU-011 | ✅ Implementado; CU-008 actualizado con monedas/categorías dinámicas |
| Dashboard | `docs/use-case/dashboard/dashboard.md` | CU-012 a CU-014 | ✅ Implementado; BUG-001 documentado |
| Configuración | `docs/use-case/settings/settings.md` | CU-015 a CU-017, CU-022, CU-023 | ✅ Implementado · 📝 CU-022/023 propuestos |
| Onboarding | `docs/use-case/onboarding/onboarding.md` | CU-018, CU-021 | ✅ CU-018 implementado · 📝 CU-021 propuesto |
| Categorías | `docs/use-case/categories/categories.md` | CU-024 a CU-026 | 📝 PROPUESTO |
| Futuras | `docs/use-case/future/future.md` | CU-019, CU-020 | 🔜 v1.2 |

---

## 4. Funcionalidad nueva propuesta (decisiones cerradas)

### 4.1 Monedas — CU-021 a CU-023

**CU-021 · Primer ingreso** (`onboarding`):
- Tras el registro, el sistema pide **moneda principal (S/, $ o €) y monto de presupuesto mensual**.
- Obligatorio, solo la **primera vez**; sin completarlo no se accede al dashboard.
- El trigger de registro dejará de crear presupuesto default S/ 1000: solo creará el perfil.
- Cambiar la moneda principal después queda **fuera de alcance**.

**CU-022 · Agregar moneda** (`settings`):
- Se ofrecen solo las monedas no activas; agregar no crea presupuesto automático (se configura en CU-015).

**CU-023 · Quitar moneda** (`settings`):
- Solo monedas secundarias; la principal no se puede quitar.
- **Decisión del usuario:** eliminar también los gastos y el presupuesto de esa moneda, con modal de confirmación que indica la cantidad de gastos. Acción irreversible.

### 4.2 Categorías — CU-024 a CU-026 (`categories`, módulo nuevo)

**CU-024 · Crear:** nombre obligatorio (máx. 30, único por usuario sin distinguir mayúsculas), icono y color desde selectores cerrados.
**CU-025 · Editar:** nombre, icono y color de cualquier categoría, incluidas las 5 por defecto; **"Otros" no es editable**.
**CU-026 · Eliminar:** cualquier categoría excepto "Otros"; antes de confirmar, modal con la cantidad de gastos que **pasarán a "Otros"**; la reasignación conserva monto, fecha, moneda y descripción.

### 4.3 Decisiones de producto tomadas

| Tema | Decisión |
|------|----------|
| Categorías por defecto | Editables y eliminables, salvo "Otros" (protegida) |
| Eliminar categoría con gastos | Reasignar a "Otros" con advertencia previa y conteo |
| Quitar moneda con datos | Eliminar gastos + presupuesto, con confirmación explícita |
| Iconos y colores de categoría | Selectores cerrados (catálogo pendiente de diseño) |
| Moneda inicial | Elegir moneda y monto en el primer ingreso, solo una vez |
| Release de los 6 CUs | Sin asignar |

---

## 5. Impacto técnico pendiente (NO implementado)

- **Base de datos:**
  - `expenses.category` tiene `CHECK (category IN ('food','transport','services','entertainment','other'))` → debe eliminarse para admitir categorías personalizadas.
  - Crear tabla `categories` por usuario (id, nombre, icono, color, flags para "Otros") con RLS; decidir si `expenses` referencia por ID o mantiene texto. **Diseño de schema PENDIENTE.**
  - `budgets` ya soporta cualquier moneda (`UNIQUE(user_id, currency)`): no requiere cambio para S/, $, €.
  - Trigger `handle_new_user`: debe dejar de insertar presupuesto y moneda fija.
  - Marcar configuración inicial completada: nueva columna/flag en `profiles` o criterio equivalente. **PENDIENTE.**
- **Frontend:**
  - `src/lib/categories.ts`: catálogo hardcodeado → datos del usuario.
  - `CURRENCY_OPTIONS` fijo en `src/app/dashboard/settings/page.tsx` y `src/app/dashboard/add-expense/page.tsx` → monedas activas.
  - Selectores de categoría en alta/edición de gasto → dinámicos.
  - Nueva pantalla de configuración inicial y gestión de categorías.
  - `src/types/index.ts`: `ExpenseCategory` deja de ser union cerrado.

---

## 6. Brechas conocidas en el código (priorizadas)

### P0 — Logout ignora errores de Supabase
- `signOut()` devuelve `{ error }` (`src/lib/supabase/auth.ts:17-20`), pero `store.logout()` no lo revisa y limpia el estado igualmente (`src/lib/store.tsx:121-125`).
- Los callers redirigen siempre a `/onboarding`: `src/components/ui/Sidebar.tsx:46` y `src/app/dashboard/settings/page.tsx:162-165`.
- La documentación de CU-005 dice que un fallo conserva la sesión y muestra error; **el código no cumple eso**.
- El handoff anterior ubicaba mal la redirección ("store línea 124"): la redirección está en los callers.

### P1 — BUG-001: nivel `exceeded` inalcanzable
- `src/app/dashboard/page.tsx:48-50`: `percentage` se limita a 100 con `Math.min(..., 100)`, por lo que `percentage >= 101` nunca ocurre.
- El dashboard solo muestra `warning` (≥80) y `critical` (≥100); `exceeded` es código muerto.
- Settings muestra el nivel "Superado 101%", que no puede alcanzarse.
- **Decisión pendiente:** quitar el cap (recomendado) o eliminar `exceeded` de la documentación.

### P1 — Otras discrepancias documentación/código
- `src/middleware.ts:41-42`: `/` es pública en `publicPaths`, aunque CU-006 la documenta como protegida. Es intencional (la raíz redirige client-side) pero la doc debe alinearse.
- CU-007 promete tooltip *"No disponible por el momento"* en el botón de Google; **no existe** en `src/app/login/page.tsx:288-294`.
- CU-002 exige nombre máx. 200 caracteres; el input no tiene `maxLength`.

### Decisiones de UX aún abiertas
> ✅ **RESUELTO (29 oct 2026)** — ver detalle en `PENDIENTES.md` §C.
- **Pantalla "Sesión cerrada":** ✅ decided → ruta dedicada **`/session-closed`** (pública, con botón a `/login`). Definido en `auth.md` CU-005 y §Decisiones pendientes 2; `settings.md` CU-017 y `USER_STORY_MAP.md` §9 alineados. *El código todavía redirige a `/onboarding` — brecha P0 en `PENDIENTES.md` A2.*
- **Pantalla "Revisa tu correo":** ✅ decided → se mantiene el **feedback inline** en `/login` ("Revisa tu correo para continuar"), sin pantalla intermedia. Definido en `auth.md` CU-003. *Sin trabajo de código pendiente.*

---

## 7. Pendientes de producto y diseño

> 📌 **Actualizado (29 oct 2026).** Los ítems 1 y 2 están resueltos; la lista vigente está en [`PENDIENTES.md`](PENDIENTES.md) §C.

1. ~~Catálogo exacto de emojis y paleta de colores para categorías.~~ ✅ **RESUELTO** — 16 emojis y 8 colores Tailwind definidos en `docs/use-case/categories/categories.md`.
2. ~~Ubicación de la gestión de categorías en la navegación.~~ ✅ **RESUELTO** — panel en `/dashboard/settings` + acceso rápido `+ Nueva categoría` desde el selector de gasto (`categories.md` CU-024).
3. **Pendiente:** Asignar release a CU-021 a CU-026.
4. **Pendiente:** Diseño del schema de categorías y del flag de configuración inicial. *(resuelto en `docs/architecture/ARCHITECTURE_SPEC.md` §1 — pendiente de implementar)*
5. **Pendiente:** Resolver BUG-001. *(las pantallas post-logout y post-recuperación ya están resueltas)*

---

## 8. Próximos pasos recomendados (en orden)

1. **Revisar y aprobar este checkpoint** y el Canvas (`docs/use-case/RED_CASOS_DE_USO.canvas`).
2. **Corregir logout (P0):** propagar el error desde `store.logout()`, no limpiar sesión ni redirigir si falla, y mostrar feedback en Sidebar y Settings (máx. 3 archivos). Ejecutar `npm run typecheck`.
3. **Resolver BUG-001:** eliminar el cap de 100% en `dashboard/page.tsx` y verificar los 3 umbrales. Añadir una comprobación enfocada si se introduce lógica nueva.
4. **Implementar CU-021 a CU-023** empezando por migraciones (trigger y flag de configuración inicial), o **CU-024 a CU-026** empezando por la tabla `categories` y la eliminación del `CHECK`. Cargar la skill `supabase-postgres-best-practices` antes de tocar schema/RLS.
5. **Actualizar docs y Canvas** tras cualquier decisión o implementación; ejecutar `graphify update .`.

---

## 9. Verificación realizada

- 26 CUs documentados, IDs únicos, sin duplicados.
- Canvas: JSON válido, 56 nodos, 68 conexiones, 54 enlaces a archivos y headings existentes.
- Sin contradicciones pendientes conocidas entre los CUs nuevos y los actualizados (CU-002, CU-008, CU-015, US-001, US-006, US-013).
- `graphify update .` ejecutado tras los cambios de documentación.
- **No se ejecutaron** `npm run typecheck`, `npm run build` ni la app: esta sesión solo modificó documentación. No hay tests automatizados.

---

## 10. Archivos modificados en esta sesión

**Documentación funcional:**
- `docs/use-case/README.md` — índice con 7 módulos y estado.
- `docs/use-case/USER_STORY_MAP.md` — US-019 a US-021, release propuesta, trazabilidad y criterios alineados.
- `docs/use-case/auth/auth.md` — CU-002 y anexo de decisiones actualizados.
- `docs/use-case/expenses/expenses.md` — CU-008 con monedas/categorías dinámicas; pregunta de "Agregar categoría" resuelta.
- `docs/use-case/settings/settings.md` — CU-015 actualizado; CU-022 y CU-023 nuevos.
- `docs/use-case/onboarding/onboarding.md` — CU-021 nuevo.
- `docs/use-case/categories/categories.md` — **nuevo**, CU-024 a CU-026.
- `docs/use-case/RED_CASOS_DE_USO.canvas` — **nuevo**, red navegable en Obsidian.
- `HANDOFF_AUTH_REVIEW.md` — este checkpoint (reemplaza el handoff del 28 oct).

**Generado por herramientas:**
- `graphify-out/*` — grafo actualizado (esperado).

---

## 11. Convenciones para el siguiente dev

- Leer `docs/use-case/README.md` antes de implementar; cada CU es la especificación funcional.
- No convertir un **PROPUESTO** en comportamiento implementado sin actualizar su estado y la documentación.
- No inventar reglas de negocio: si falta una decisión, marcarla **PENDIENTE** y consultar.
- Usar la skill `use-case-writer` para editar/crear CUs, y `supabase-postgres-best-practices` para schema/RLS.
- Mantener el Canvas actualizado si cambian IDs, títulos o relaciones entre CUs.
- Consultar Graphify antes de explorar el código: `graphify query "..."`, `graphify explain "..."`, `graphify path "A" "B"`.
