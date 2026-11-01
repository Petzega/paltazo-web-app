# BUG-004: No se puede eliminar moneda principal — Fix: promoción automática + botón Quitar visible en UI

> **Estado:** ✅ Resuelto  
> **Severidad:** Medium (limita funcionalidad esperada por el usuario)  
> **Fase donde se detectó:** Post-audit, iteración de mejoras  
> **Fecha:** 01 nov 2026  
> **Resuelto:** 01 nov 2026

---

## Resumen

La aplicación no permitía eliminar la moneda principal (configurada durante el setup inicial). Cuando un usuario quería cambiar su moneda principal (ej: de Soles a Dólares), no podía eliminar Soles porque el sistema lo bloqueaba explícitamente.

**Impacto:**
- Usuario configura Soles como moneda principal durante setup
- Agrega Dólares como segunda moneda
- Ya no necesita Soles pero no puede eliminarlos
- No puede promover Dólares a moneda principal

---

## Pasos para reproducir

1. Registrarse y completar setup con Soles (S/) como moneda principal
2. Ir a Ajustes → Presupuestos por moneda
3. Agregar Dólares ($) como segunda moneda
4. Intentar eliminar Soles (moneda principal) haciendo clic en "Quitar"
5. **Comportamiento observado:** no pasa nada, la moneda no se elimina

---

## Comportamiento esperado

Al eliminar la moneda principal:
1. Se eliminan todos los gastos e ingresos en esa moneda
2. Se elimina el presupuesto de esa moneda
3. **La siguiente moneda disponible pasa a ser la principal automáticamente**
4. Si no quedan monedas, se resetea al estado por defecto

---

## Comportamiento actual (antes del fix)

```ts
// ❌ ANTES: bloqueo explícito
const removeCurrency = async (currency: string) => {
  if (!userId) return
  if (currency === budget.currency) return // No se puede eliminar la principal
  // ... resto de la lógica
}
```

---

## Causa raíz

**Línea 298 en `src/lib/store.tsx`:**
```ts
if (currency === budget.currency) return
```

Esta validación impedía eliminar la moneda principal bajo el supuesto de que "siempre debe haber una moneda principal". Sin embargo, no contemplaba el caso de uso donde el usuario quiere cambiar su moneda principal eliminando la anterior.

---

## Fix aplicado

### `src/lib/store.tsx` — función `removeCurrency`

**Cambios:**
1. **Eliminada** la validación `if (currency === budget.currency) return`
2. **Refactorizada** la actualización de `budgets` para usar un loop explícito (más claro que `delete`)
3. **Agregada** lógica de promoción: si se elimina la moneda principal, la siguiente moneda disponible en `budgets` pasa a ser la principal
4. **Fallback:** si no quedan monedas, se resetea a `DEFAULT_BUDGET`

```ts
// ✅ DESPUÉS: permite eliminar la principal y promueve la siguiente
const removeCurrency = async (currency: string) => {
  if (!userId) return
  // Transacción atómica: elimina gastos, ingresos + presupuesto de esa moneda
  await db.deleteCurrencyWithPurge(userId, currency)
  // Actualizar estado local
  const nextBudgets: Record<string, Budget> = {}
  for (const [key, val] of Object.entries(budgets)) {
    if (key !== currency) nextBudgets[key] = val
  }
  setBudgets(nextBudgets)
  setExpenses((prev) => prev.filter((e) => e.currency !== currency))
  setIncomes((prev) => prev.filter((i) => i.currency !== currency))
  // Si se eliminó la moneda principal, promover la siguiente disponible
  if (currency === budget.currency) {
    const nextCurrency = Object.keys(nextBudgets)[0]
    if (nextCurrency && nextBudgets[nextCurrency]) {
      setBudgetState(nextBudgets[nextCurrency])
    } else {
      setBudgetState(DEFAULT_BUDGET)
    }
  }
}
```

---

## Flujo de promoción de moneda principal

```
Estado inicial:
- budget.currency = "S/" (principal)
- budgets = { "S/": {...}, "$": {...} }

Usuario elimina "S/":
1. db.deleteCurrencyWithPurge(userId, "S/") → elimina gastos, ingresos y presupuesto de Soles
2. nextBudgets = { "$": {...} } (sin Soles)
3. setBudgets(nextBudgets)
4. currency === budget.currency → true (se eliminó la principal)
5. nextCurrency = "$" (primera moneda disponible)
6. setBudgetState(nextBudgets["$"]) → Dólares ahora es la principal

Estado final:
- budget.currency = "$" (nueva principal)
- budgets = { "$": {...} }
```

---

## Archivos afectados

### `src/lib/store.tsx`
- **Línea 296-317:** Refactorizada función `removeCurrency`
- **Eliminada:** validación `if (currency === budget.currency) return`
- **Agregada:** lógica de promoción de moneda principal

### `src/app/dashboard/settings/page.tsx`
- **Línea 258-275:** Botón "Quitar" ahora se renderiza para TODAS las monedas (incluida la principal)
- **Línea 540-544:** Mensaje del modal actualizado para avisar cuando se elimina la moneda principal

---

## Tests manuales realizados

- [x] Eliminar moneda secundaria (Dólares) → funciona correctamente
- [x] Eliminar moneda principal (Soles) → botón "Quitar" ahora visible
- [x] Eliminar moneda principal → se elimina y Dólares pasa a ser principal
- [x] Eliminar última moneda → se resetea a DEFAULT_BUDGET
- [x] Gastos en moneda eliminada → se eliminan correctamente
- [x] Ingresos en moneda eliminada → se eliminan correctamente
- [x] Presupuesto de moneda eliminada → se elimina correctamente
- [x] UI muestra nueva moneda principal correctamente
- [x] Modal de confirmación muestra mensaje adecuado para moneda principal

---

## Lecciones aprendidas

1. **No bloquear operaciones válidas:** El bloqueo `if (currency === budget.currency) return` era una protección excesiva que impedía un caso de uso legítimo (cambiar moneda principal).

2. **Promoción automática:** Cuando se elimina un recurso "principal", el sistema debe promover automáticamente el siguiente recurso disponible en lugar de fallar o bloquear la operación.

3. **Fallback seguro:** Siempre debe haber un estado por defecto (`DEFAULT_BUDGET`) para evitar estados inconsistentes cuando no quedan recursos.

4. **Transacciones atómicas:** La eliminación de moneda debe ser atómica (gastos + ingresos + presupuesto) para evitar datos huérfanos.

---

## Referencias

- `src/lib/store.tsx` — función `removeCurrency`
- `src/app/dashboard/settings/page.tsx` — UI de gestión de monedas
- `src/lib/supabase/repositories.ts` — función `deleteCurrencyWithPurge`
