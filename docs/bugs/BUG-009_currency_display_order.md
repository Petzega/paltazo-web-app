# BUG-009: Monedas siempre se muestran en orden fijo (S/, $, €) en lugar del orden de configuración — Fix: ordenar por orden de creación

> **Estado:** ✅ Resuelto  
> **Severidad:** Medium (UX, no respeta preferencia del usuario)  
> **Fase donde se detectó:** Post-audit (01 nov 2026)  
> **Resuelto:** 02 nov 2026

---

## Resumen

Cuando un usuario agrega monedas en un orden específico (ej: primero USD, luego S/), la página de Settings siempre las muestra en orden fijo `S/, $, €` en lugar del orden en que se configuraron. Adicionalmente:
- La primera moneda configurada no siempre queda como principal (dependía de `DEFAULT_BUDGET` hardcodeado a S/)
- Al eliminar la moneda principal, la promoción no se persistía en `profiles.primary_currency`
- En onboarding, `setBudget` no actualizaba `budgetState` si `budget.currency` no coincidía (siempre S/ inicial), dejando el badge "Principal" invisible hasta recargar

**Impacto:**
- Usuario pierde el orden de preferencia al configurar monedas
- La moneda "Principal" cambia inesperadamente al agregar una nueva
- Badge "Principal" no aparece hasta recargar la página
- La moneda principal no se persiste si se elimina la actual

---

## Pasos para reproducir

1. Registrarse como nuevo usuario
2. En setup inicial, seleccionar **USD** como moneda principal con presupuesto de 5867
3. Ver Settings → "Presupuestos por moneda"
4. **Comportamiento observado:** USD aparece sin badge "Principal", al guardar presupuesto sigue sin aparecer
5. Agregar S/ → S/ aparece como "Principal"
6. Recargar página → recién ahí USD se muestra como principal

---

## Causa raíz

**Problema 1: `getBudgets` sin orden**

```ts
// src/lib/supabase/repositories.ts:170-177
export async function getBudgets(userId: string): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    // ❌ Sin order → orden indeterminado de Supabase
```

`bs[0]` como fallback en `applySession` no garantiza la moneda más antigua.

**Problema 2: `setBudget` no actualiza `budgetState` para primera moneda**

```ts
// src/lib/store.tsx:278-280
if (targetCurrency === budget.currency) {
  setBudgetState(updated)
}
```

En onboarding: `budget.currency = 'S/'` (DEFAULT_BUDGET), `targetCurrency = '$'` → condición falsa → `budgetState` nunca se actualiza → badge "Principal" invisible.

**Problema 3: `addCurrency` no setea principal para primera moneda**

```ts
// src/lib/store.tsx:283-293
const addCurrency = async (currency: string) => {
  // ...
  await db.upsertBudget(newBudget)
  setBudgets((prev) => ({ ...prev, [currency]: newBudget }))
  // ❌ No verifica si es primera moneda → no setea primary_currency
}
```

**Problema 4: `removeCurrency` no persiste promoción en DB**

```ts
// src/lib/store.tsx:296-316
if (currency === budget.currency) {
  const nextCurrency = Object.keys(nextBudgets)[0]
  if (nextCurrency && nextBudgets[nextCurrency]) {
    setBudgetState(nextBudgets[nextCurrency])
    // ❌ No llama updatePrimaryCurrency → promoción solo en memoria
  }
}
```

---

## Fix aplicado

### 1. `src/lib/supabase/repositories.ts`

**a) Ordenar budgets por `created_at ASC`:**

```ts
export async function getBudgets(userId: string): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })  // ← Agregado
```

**b) Nueva función `updatePrimaryCurrency`:**

```ts
export async function updatePrimaryCurrency(userId: string, currency: string | null) {
  const { error } = await supabase
    .from('profiles')
    .update({ primary_currency: currency })
    .eq('id', userId)
  if (error) throw error
}
```

### 2. `src/lib/store.tsx`

**a) `setBudget` — actualizar estado si es primera moneda (`monthlyLimit === 0`):**

```ts
if (targetCurrency === budget.currency || budget.monthlyLimit === 0) {
  setBudgetState(updated)
}
```

**b) `addCurrency` — si es primera moneda, setea principal:**

```ts
const addCurrency = async (currency: string) => {
  if (!userId) return
  if (budgets[currency]) return
  const isFirst = Object.keys(budgets).length === 0
  const newBudget: Budget = { /* ... */ }
  await db.upsertBudget(newBudget)
  setBudgets((prev) => ({ ...prev, [currency]: newBudget }))
  if (isFirst) {
    await db.updatePrimaryCurrency(userId, currency)
    setBudgetState(newBudget)
  }
}
```

**c) `removeCurrency` — promueve la más antigua y persiste en DB:**

```ts
if (currency === budget.currency) {
  const nextKeys = Object.keys(nextBudgets)
  if (nextKeys.length > 0) {
    const promoted = nextBudgets[nextKeys[0]]
    setBudgetState(promoted)
    await db.updatePrimaryCurrency(userId, promoted.currency)
  } else {
    setBudgetState(DEFAULT_BUDGET)
    await db.updatePrimaryCurrency(userId, null)
  }
}
```

---

## Archivos afectados

- `src/lib/supabase/repositories.ts` — `getBudgets` ordena por `created_at ASC`; nueva función `updatePrimaryCurrency`
- `src/lib/store.tsx` — `setBudget`, `addCurrency`, `removeCurrency`, `applySession`

---

## Lecciones aprendidas

1. **`DEFAULT_BUDGET` hardcodeado a S/** contamina cualquier lógica que dependa de `budget.currency` antes de que exista un presupuesto real. Condición `monthlyLimit === 0` como proxy confiable de "no hay presupuesto real".
2. **`Record<string, Budget>` no garantiza orden.** El orden de inserción en JS objects se mantiene en V8, pero Supabase no retorna filas en orden de inserción sin `ORDER BY`.
3. **Persistir `primary_currency` en DB** es necesario, no solo en estado React. Al eliminar la moneda principal, la promoción debe escribirse en `profiles.primary_currency`.
4. **JavaScript object order no es confiable para persistencia:** El orden de inserción en objetos JS se mantiene en memoria, pero no necesariamente al serializar/deserializar desde DB.

---

## Referencias

- `docs/bugs/BUG-008_dashboard_soles_ghost.md` — bug relacionado con `DEFAULT_BUDGET` hardcodeado a S/
- `src/lib/supabase/repositories.ts:170` — `getBudgets`
- `src/lib/store.tsx:265-316` — `setBudget`, `addCurrency`, `removeCurrency`
- `supabase/migrations/20261029000003_profiles_onboarding.sql` — tabla `profiles` con `primary_currency`
