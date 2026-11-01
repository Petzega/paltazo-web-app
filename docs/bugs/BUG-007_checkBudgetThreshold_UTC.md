# BUG-007: checkBudgetThreshold UTC bug — Fix: usa date.startsWith(prefix) en lugar de new Date()

> **Estado:** ✅ Resuelto  
> **Severidad:** High (alertas de presupuesto en momento incorrecto)  
> **Fase donde se detectó:** Post-audit (01 nov 2026)  
> **Resuelto:** 01 nov 2026

---

## Resumen

La función `checkBudgetThreshold` en `store.tsx` calculaba el gasto mensual usando `new Date(e.date)` para extraer mes y año. Esto parsea fechas en formato `YYYY-MM-DD` como UTC medianoche, causando que gastos registrados entre las 7pm-midnight (hora local Perú) se contaran en el mes **anterior**.

**Impacto:**
- Alertas de presupuesto se disparan en momento incorrecto (o no se disparan)
- Usuario recibe notificación de "80% de presupuesto gastado" cuando aún no ha alcanzado ese umbral
- Confusión y desconfianza en las alertas

---

## Causa raíz

```ts
// ❌ ANTES: parsea fechas como UTC
const monthlySpent = expenses
  .filter((e) => {
    const expDate = new Date(e.date)  // "2026-11-01" → UTC midnight → 31 oct 7pm Perú
    const now = new Date()
    return e.currency === currency 
      && expDate.getMonth() === now.getMonth()      // getMonth() usa zona horaria local
      && expDate.getFullYear() === now.getFullYear()
  })
```

**Problema:**
- `e.date` viene como string `"2026-11-01"` (formato ISO date-only)
- `new Date("2026-11-01")` parsea como UTC: `2026-11-01T00:00:00Z`
- En Perú (UTC-5), eso es `2026-10-31T19:00:00-05:00`
- `expDate.getMonth()` devuelve `9` (octubre) en lugar de `10` (noviembre)
- Gasto del 1 de noviembre se cuenta en octubre

Este es el mismo bug que BUG-003 (fechas UTC), pero en una función diferente.

---

## Fix aplicado

### `src/lib/store.tsx:checkBudgetThreshold()`

```ts
// ✅ DESPUÉS: usa string matching con zona horaria local
const now = new Date()
const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const monthlySpent = expenses
  .filter((e) => e.currency === currency && e.date.startsWith(prefix))
  .reduce((sum, e) => sum + e.amount, 0)
```

**Ventajas:**
- `e.date` es string `"2026-11-01"` en zona horaria local (ya fue corregido al guardar)
- `prefix` es `"2026-11"` para noviembre
- `e.date.startsWith("2026-11")` matchea todos los gastos de noviembre
- No hay conversión a Date, no hay ambigüedad de zona horaria
- Consistente con el patrón usado en `dashboard/page.tsx:39` (monthlyExpenses)

---

## Ejemplo del bug

```
Fecha del gasto: "2026-11-01" (1 de noviembre, hora local Perú)
Usuario registra gasto a las 8pm (20:00) el 31 de octubre

new Date("2026-11-01")
  → 2026-11-01T00:00:00Z (UTC)
  → 2026-10-31T19:00:00-05:00 (Perú)

expDate.getMonth()
  → 9 (octubre) ❌

now.getMonth() (si estamos en noviembre)
  → 10 (noviembre)

Resultado: gasto NO se cuenta en noviembre, se cuenta en octubre
Alerta de presupuesto se dispara un día tarde
```

---

## Archivos afectados

- `src/lib/store.tsx:471-491` — función `checkBudgetThreshold` refactorizada
- Eliminado: `new Date(e.date)` con getMonth()/getFullYear()
- Agregado: `e.date.startsWith(prefix)` con prefix en formato `YYYY-MM`

---

## Tests manuales realizados

- [x] Registrar gasto el 31 oct a las 8pm → se cuenta en octubre
- [x] Registrar gasto el 1 nov a las 12am → se cuenta en noviembre
- [x] Alerta de presupuesto se dispara al alcanzar 80% del límite
- [x] Alerta NO se dispara si el gasto es de otro mes
- [x] Cálculo mensual incluye todos los gastos del mes actual

---

## Lecciones aprendidas

1. **Nunca usar `new Date(dateString)` con strings date-only:** Siempre parsea como UTC, causando off-by-one en zonas horarias negativas (Américas).
2. **Usar patrones consistentes:** El dashboard ya usaba `startsWith(prefix)` para filtrar por mes. `checkBudgetThreshold` debería haber usado el mismo patrón desde el inicio.
3. **Auditar todas las funciones que manipulan fechas:** BUG-003 arregló las fechas en 7 archivos, pero esta función quedó fuera. Siempre buscar `new Date(e.date)` o `new Date(dateString)` en el codebase.
4. **Testear con zonas horarias extremas:** El bug solo aparece en zonas horarias negativas (Américas). En Europa/Asia, el bug es invisible.

---

## Referencias

- `src/lib/expenseConstants.ts:getLocalDate()` — fuente de verdad para fechas locales
- `src/app/dashboard/page.tsx:38-46` — patrón correcto usado en dashboard
- `docs/bugs/BUG-003_date_timezone_utc.md` — bug original de fechas UTC (relacionado)
- Convención establecida: siempre usar `new Date(date + 'T12:00:00')` para parsear fechas de DB
