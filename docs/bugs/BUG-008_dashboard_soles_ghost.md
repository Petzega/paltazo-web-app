# BUG-008: Dashboard muestra S/ fantasma cuando usuario elige USD como moneda principal — Fix: DEFAULT_BUDGET no debe agregar monedas inexistentes

> **Estado:** ✅ Resuelto  
> **Severidad:** High (incongruencia de datos, confusión de usuario)  
> **Fase donde se detectó:** Post-audit (01 nov 2026)  
> **Resuelto:** 01 nov 2026

---

## Resumen

Cuando un usuario nuevo se registra y elige USD como moneda principal (con presupuesto de 950), el dashboard muestra **dos monedas**: S/ en primera posición (con 0.00) y USD en segunda posición (con 950.00). Sin embargo, en Settings solo aparece USD.

**Impacto:**
- Usuario ve moneda S/ que nunca configuró
- Incongruencia entre Dashboard (2 monedas) y Settings (1 moneda)
- Confusión sobre qué moneda es la "principal"
- Balance del mes muestra 2 monedas cuando solo debería mostrar 1

---

## Causa raíz

**Problema 1: DEFAULT_BUDGET hardcodea S/**

```ts
// src/lib/store.tsx:46-51
const DEFAULT_BUDGET: Budget = {
  userId: '',
  monthlyLimit: 0,
  currency: 'S/',  // ❌ Hardcodeado
  updatedAt: new Date().toISOString(),
}
```

Cuando el store se inicializa, `budget = DEFAULT_BUDGET` con `currency: 'S/'`.

**Problema 2: Dashboard agrega `budget.currency` a las monedas activas**

```ts
// src/app/dashboard/page.tsx:51-53
if (Object.keys(budgets).length > 0) {
  activeCurrencies.add(budget.currency)  // ❌ Agrega S/ aunque no exista en budgets
  Object.keys(budgets).forEach((c) => activeCurrencies.add(c))
}
```

**Flujo del bug:**
1. Usuario se registra con USD como moneda principal
2. `completeOnboarding('USD', 950)` llama a `setBudget(950, 'USD')`
3. `setBudget` hace upsert en Supabase con `currency: 'USD'`
4. `loadUserData` carga budgets: `{ 'USD': { monthlyLimit: 950, currency: 'USD' } }`
5. `loadUserData` línea 104: `currencyKey = profile.primaryCurrency || budget.currency`
   - `profile.primaryCurrency = 'USD'` ✅
   - `primaryBudget = budgetsMap['USD']` ✅
   - `setBudgetState(primaryBudget)` → `budget.currency = 'USD'` ✅
6. Dashboard renderiza `currencySummaries`:
   - `budgets = { 'USD': {...} }` → `Object.keys(budgets).length > 0` ✅
   - `activeCurrencies.add(budget.currency)` → agrega 'USD' ✅
   - `activeCurrencies.add('USD')` → duplicado, no hay problema ✅
7. **PERO:** el sort prioriza S/ sobre USD:
   ```ts
   if (a.currency === 'S/') return -1  // ❌ S/ siempre primero
   if (b.currency === 'S/') return 1
   ```
8. **Resultado:** S/ aparece en primera posición aunque no exista en budgets

**Espera, esto no explica por qué S/ aparece...**

Revisemos más a fondo. Si `budget.currency = 'USD'` después de `loadUserData`, entonces `activeCurrencies.add('USD')` solo agrega USD. No hay S/ en el set.

**Hipótesis alternativa:** ¿Hay un bug en `setBudget` que no actualiza `budget.currency` correctamente?

```ts
const setBudget = async (monthlyLimit: number, currency?: string) => {
  if (!userId) return
  const updated: Budget = {
    ...budget,
    monthlyLimit,
    currency: currency || budget.currency,
    updatedAt: new Date().toISOString(),
  }
  // ...
}
```

Si `currency` es undefined, usa `budget.currency` (que podría ser S/ si no se actualizó).

**Verificación necesaria:** ¿`setBudget(950, 'USD')` actualiza `budget.currency` a 'USD'?

Sí, debería hacerlo. Pero... ¿qué pasa si `loadUserData` se ejecuta **después** de que el dashboard ya renderizó una vez con `DEFAULT_BUDGET`?

**Race condition posible:**
1. `applySession` se ejecuta, `budget = DEFAULT_BUDGET` (S/)
2. Dashboard renderiza con `budget.currency = 'S/'`
3. `loadUserData` termina, `budget` se actualiza a USD
4. Dashboard re-renderiza, pero S/ ya se mostró

**Solución:** El dashboard no debe mostrar `budget.currency` si no existe en `budgets` Y tiene `monthlyLimit === 0`.

---

## Fix propuesto

### Opción A: Filtrar monedas sin presupuesto ni gastos

```ts
// src/app/dashboard/page.tsx:48-54
const currencySummaries: CurrencySummary[] = useMemo(() => {
  const activeCurrencies = new Set(monthlyExpenses.map((e) => e.currency))
  
  // Solo agregar monedas que tengan presupuesto configurado
  Object.keys(budgets).forEach((c) => activeCurrencies.add(c))
  
  // NO agregar budget.currency automáticamente (puede ser DEFAULT_BUDGET fantasma)
  // budget se usa solo para determinar la moneda principal en otros lugares

  // ...
})
```

**Ventajas:**
- S/ fantasma desaparece
- Solo se muestran monedas con presupuesto real

**Desventajas:**
- Si el usuario tiene moneda principal sin presupuesto, no se muestra en dashboard
- Necesita validación: ¿qué pasa si `budget.currency` no está en `budgets`?

### Opción B: Usar `profile.primaryCurrency` en lugar de `budget.currency`

```ts
// src/lib/store.tsx
interface AppState {
  // ...
  primaryCurrency: string | null  // NUEVO: moneda principal del perfil
}

// En loadUserData:
const primaryCurrency = profile.primaryCurrency || (bs.length > 0 ? bs[0].currency : null)
setPrimaryCurrency(primaryCurrency)
```

Luego en el dashboard:
```ts
if (primaryCurrency && Object.keys(budgets).length > 0) {
  activeCurrencies.add(primaryCurrency)
}
```

**Ventajas:**
- Separación clara entre "moneda principal" y "presupuesto principal"
- No depende de `DEFAULT_BUDGET`

**Desventajas:**
- Cambio más grande en el store
- Requiere actualizar múltiples lugares

### Opción C: Validar que `budget.currency` exista en `budgets` antes de agregarla

```ts
// src/app/dashboard/page.tsx:51-53
if (Object.keys(budgets).length > 0 && budgets[budget.currency]) {
  activeCurrencies.add(budget.currency)
  Object.keys(budgets).forEach((c) => activeCurrencies.add(c))
}
```

**Ventajas:**
- Fix mínimo, solo agrega validación
- No cambia estructura de datos

**Desventajas:**
- Si el usuario tiene moneda principal sin presupuesto, no se muestra

**Recomendación:** Opción C (más simple, resuelve el bug inmediato).

---

## Archivos afectados

- `src/lib/store.tsx:46-51` — DEFAULT_BUDGET con S/ hardcodeado
- `src/lib/store.tsx:104-109` — lógica de primaryBudget
- `src/app/dashboard/page.tsx:51-53` — agrega budget.currency sin validar
- `src/app/dashboard/page.tsx:77-80` — sort prioriza S/ sobre otras monedas

---

## Ejemplo del bug

```
Usuario se registra con:
- Moneda principal: USD
- Presupuesto: 950

Dashboard muestra:
┌─────────────────────────────┐
│ BALANCE DEL MES    2 monedas │
├─────────────────────────────┤
│ S/                           │
│ Ingresos +0.00               │
│ Gastos -0.00                 │
├─────────────────────────────┤
│ USD                          │
│ Ingresos +0.00               │
│ Gastos -0.00                 │
└─────────────────────────────┘

Settings muestra:
┌─────────────────────────────┐
│ Presupuestos por moneda      │
├─────────────────────────────┤
│ Dólares ($)      Configurado │
│ $ [950]          [Guardar]   │
├─────────────────────────────┤
│ + Soles (S/)  + Euros (€)   │
└─────────────────────────────┘

❌ Incongruencia: Dashboard muestra 2 monedas, Settings muestra 1
```

---

## Lecciones aprendidas

1. **DEFAULT_BUDGET no debe tener moneda hardcodeada:** Debería ser null o derived del perfil.
2. **Validar existencia antes de usar:** Si `budget.currency` se agrega a sets, verificar que exista en budgets.
3. **Sort no debe priorizar monedas específicas:** El sort `if (a.currency === 'S/') return -1` asume que S/ siempre existe, lo cual no es cierto para usuarios internacionales.
4. **Race conditions en inicialización:** El estado inicial (`DEFAULT_BUDGET`) puede renderizarse antes de que `loadUserData` complete.

---

## Referencias

- `docs/bugs/BUG-004_remove_primary_currency.md` — bug relacionado con moneda principal
- `docs/bugs/BUG-006_delete_currency_includes_incomes.md` — eliminación de monedas
- `src/lib/store.tsx:46-51` — DEFAULT_BUDGET
- `src/app/dashboard/page.tsx:51-53` — lógica de currencySummaries
