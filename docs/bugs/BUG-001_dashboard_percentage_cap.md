# BUG-001: Dashboard percentage cap — Fix: eliminar Math.min de 100%

> **Estado:** ✅ Resuelto  
> **Severidad:** High (lógica de negocio incorrecta, alertas no se disparan)  
> **Fase donde se detectó:** Post-audit (29 oct 2026)  
> **Resuelto:** 29 oct 2026

---

## Resumen

El cálculo de `percentage` en `currencySummaries` tenía un tope artificial de 100% usando `Math.min()`, lo que impedía que el nivel `exceeded` (>= 101%) se activara correctamente.

**Impacto:**
- Nivel `exceeded` era inalcanzable en la práctica
- Usuario no veía alerta visual cuando superaba el presupuesto (>100%)
- Badge mostraba ">100%" pero el `alertLevel` interno nunca alcanzaba `exceeded`

---

## Causa raíz

```ts
// ❌ ANTES: tope artificial de 100%
const percentage = Math.min((totalExpenses / monthlyLimit) * 100, 100)
```

**Problema:**
- Si `totalExpenses = 1500` y `monthlyLimit = 1000`, el cálculo real es `150%`
- `Math.min(150, 100)` devuelve `100`
- `alertLevel` evaluaba `100 >= 101` → `false` → nunca entra en `exceeded`
- Se quedaba en `critical` (100%) en lugar de `exceeded` (>100%)

---

## Fix aplicado

### `src/app/dashboard/page.tsx:currencySummaries`

```ts
// ✅ DESPUÉS: sin tope, permite valores > 100
const percentage = monthlyLimit > 0 ? (totalExpenses / monthlyLimit) * 100 : 0
```

**Resultado:**
- `percentage` ahora refleja el valor real (puede ser 150%, 200%, etc.)
- Nivel `exceeded` se activa correctamente cuando `percentage >= 101`
- Badge muestra el valor real sin cap

---

## Ejemplo del bug

```
Gastos del mes: S/ 1,500.00
Presupuesto mensual: S/ 1,000.00

Cálculo con Math.min:
  (1500 / 1000) * 100 = 150
  Math.min(150, 100) = 100 ❌
  alertLevel = 'critical' (debería ser 'exceeded')

Cálculo sin Math.min:
  (1500 / 1000) * 100 = 150 ✅
  alertLevel = 'exceeded' ✅
  Badge muestra "150%" ✅
```

---

## Archivos afectados

- `src/app/dashboard/page.tsx:61` — línea eliminada `Math.min(..., 100)`
- Lógica de `alertLevel` ahora funciona correctamente para valores > 100%

---

## Lecciones aprendidas

1. **No capar valores de negocio:** El cálculo de porcentaje debe reflejar la realidad, incluso si supera el 100%.
2. **Niveles de alerta dependen de valores reales:** Si el dominio requiere detectar >100%, el cálculo no puede tener tope.
3. **Testear con casos extremos:** El bug solo aparecía cuando el gasto superaba el presupuesto. Tests con valores normales (<100%) no lo detectaban.

---

## Referencias

- `docs/use-case/dashboard/dashboard.md:157-167` — resolución formal de BUG-001
- `docs/architecture/ARCHITECTURE_SPEC.md:377` — P1-1 identificado
- Nivel `exceeded` documentado en CU-013 (alertas de umbral)
