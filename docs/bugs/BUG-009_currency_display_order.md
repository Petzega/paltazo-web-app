# BUG-009: Monedas siempre se muestran en orden fijo (S/, $, €) en lugar del orden de configuración — Fix: ordenar por orden de creación

> **Estado:** ✅ Resuelto  
> **Severidad:** Medium (UX, no respeta preferencia del usuario)  
> **Fase donde se detectó:** Post-audit (01 nov 2026)  
> **Resuelto:** 01 nov 2026

---

## Resumen

Cuando un usuario agrega monedas en un orden específico (ej: primero USD, luego S/), la página de Settings siempre las muestra en orden fijo `S/, $, €` en lugar del orden en que se configuraron. Adicionalmente, la moneda recién agregada se marca como "Principal" aunque ya existía otra moneda principal configurada.

**Impacto:**
- Usuario pierde el orden de preferencia al configurar monedas
- La moneda "Principal" cambia inesperadamente al agregar una nueva
- Inconsistencia entre configuración del usuario y visualización

---

## Pasos para reproducir

1. Registrarse como nuevo usuario
2. En setup inicial, seleccionar **USD** como moneda principal con presupuesto de 950
3. Ir a Settings → "Presupuestos por moneda"
4. Hacer clic en **"+ Soles (S/)"** para agregar Soles
5. **Comportamiento observado:** Soles aparece en primera posición y marcado como "Principal", USD aparece en segunda posición
6. **Comportamiento esperado:** USD debería mantenerse en primera posición como principal, Soles en segunda posición

---

## Causa raíz

**Problema 1: Settings itera sobre SUPPORTED_CURRENCIES en orden fijo**

```tsx
// src/app/dashboard/settings/page.tsx:247
{SUPPORTED_CURRENCIES.filter(c => activeCurrencies.includes(c.value)).map(({ value, label }) => {
  // ...
})}
```

`SUPPORTED_CURRENCIES` está definido en orden fijo:
```ts
const SUPPORTED_CURRENCIES = [
  { value: 'S/', label: 'Soles (S/)' },
  { value: '$', label: 'Dólares ($)' },
  { value: '€', label: 'Euros (€)' },
]
```

**Problema 2: No se preserva el orden de creación de monedas**

El store usa `Record<string, Budget>` (objeto) para `budgets`, que no garantiza orden de inserción en todos los casos. Además, no hay un campo `createdAt` o `order` en la entidad Budget para rastrear cuándo se agregó cada moneda.

**Problema 3: Moneda principal se asigna incorrectamente**

Al agregar una nueva moneda, el código no verifica si ya existe una moneda principal configurada. Si `budget.currency` no coincide con ninguna moneda en `budgets` (caso raro pero posible), la UI puede mostrar la primera moneda del array como "Principal".

---

## Flujo del bug

```
1. Usuario se registra → completeOnboarding('USD', 950)
   - budgets = { 'USD': { monthlyLimit: 950, currency: 'USD' } }
   - budget.currency = 'USD' ✅

2. Usuario agrega S/ → addCurrency('S/')
   - budgets = { 'USD': {...}, 'S/': { monthlyLimit: 0, currency: 'S/' } }
   - budget.currency = 'USD' ✅ (debería mantenerse)

3. Settings renderiza:
   - SUPPORTED_CURRENCIES.filter(c => activeCurrencies.includes(c.value))
   - activeCurrencies = ['USD', 'S/']
   - Filtro: S/ (índice 0 en SUPPORTED_CURRENCIES), USD (índice 1)
   - Orden resultante: ['S/', 'USD'] ❌

4. Settings muestra:
   - S/ en primera posición con badge "Principal" ❌
   - USD en segunda posición ❌
```

**¿Por qué S/ se marca como "Principal"?**

Si `budget.currency === 'USD'` pero S/ se renderiza primero, el badge "Principal" debería aparecer solo en USD. Sin embargo, si hay un bug en la lógica de `isPrimary`:

```tsx
const isPrimary = value === budget.currency
```

Esto debería funcionar correctamente... **a menos que** `budget.currency` se haya actualizado a 'S/' en algún momento.

**Hipótesis:** ¿`addCurrency` actualiza `budget.currency`?

```ts
// src/lib/store.tsx:283-294
const addCurrency = async (currency: string) => {
  if (!userId) return
  if (budgets[currency]) return
  const newBudget: Budget = {
    userId,
    monthlyLimit: 0,
    currency,
    updatedAt: new Date().toISOString(),
  }
  await db.upsertBudget(newBudget)
  setBudgets((prev) => ({ ...prev, [currency]: newBudget }))
  // ❌ NO actualiza budget.currency, debería mantener el existente
}
```

`addCurrency` NO actualiza `budget.currency`, así que el badge "Principal" debería aparecer correctamente en USD.

**Conclusión:** El bug principal es el **orden de visualización** (S/ siempre primero), no la asignación de moneda principal.

---

## Fix aplicado

### `src/app/dashboard/settings/page.tsx`

**Antes (línea 246):**
```tsx
{SUPPORTED_CURRENCIES.filter(c => activeCurrencies.includes(c.value)).map(({ value, label }) => {
  // ...
})}
```

**Después:**
```tsx
{activeCurrencies.map((currency) => {
  const { value, label } = SUPPORTED_CURRENCIES.find(c => c.value === currency) || { value: currency, label: currency }
  // ...
})}
```

**Explicación:**
- `activeCurrencies = Object.keys(budgets)` mantiene el orden de inserción en JavaScript ES2015+
- En lugar de iterar sobre `SUPPORTED_CURRENCIES` (orden fijo), ahora iteramos sobre las monedas del usuario en el orden en que se agregaron
- Para cada moneda, buscamos el `label` correspondiente en `SUPPORTED_CURRENCIES`
- Si la moneda no está en `SUPPORTED_CURRENCIES` (moneda custom), usamos el `currency` como fallback

**Resultado:** Las monedas ahora se muestran en el orden en que el usuario las configuró.

```sql
-- Migración: agregar created_at a budgets
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
```

```ts
// En settings/page.tsx
const activeCurrenciesSorted = Object.entries(budgets)
  .sort(([, a], [, b]) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  .map(([currency]) => currency)

{activeCurrenciesSorted.map((currency) => {
  const { label } = SUPPORTED_CURRENCIES.find(c => c.value === currency) || {}
  // ...
})}
```

**Ventajas:**
- Orden preciso basado en fecha de creación
- Persistente entre sesiones

**Desventajas:**
- Requiere migración de base de datos
- Monedas existentes no tendrán `createdAt` (usar `updated_at` como fallback)

### Opción B: Usar array ordenado en lugar de Record

```ts
// En store.tsx
interface AppState {
  budgets: Budget[]  // ❌ Antes: Record<string, Budget>
  budgetOrder: string[]  // NUEVO: orden de monedas
}
```

**Ventajas:**
- Orden explícito y controlado

**Desventajas:**
- Cambio grande en estructura de datos
- Requiere actualizar múltiples lugares

### Opción C: Ordenar por orden de inserción en el objeto (orden de iteración)

```ts
// En settings/page.tsx
const activeCurrencies = Object.keys(budgets)  // Mantiene orden de inserción en V8

{activeCurrencies.map((currency) => {
  const { label } = SUPPORTED_CURRENCIES.find(c => c.value === currency) || {}
  // ...
})}
```

**Ventajas:**
- Fix mínimo, sin migraciones
- JavaScript mantiene orden de inserción en objetos desde ES2015

**Desventajas:**
- Orden de inserción puede no ser confiable si se recarga desde Supabase
- Necesita validación: ¿`loadUserData` preserva el orden?

**Recomendación:** Opción C + agregar `created_at` en migración para persistencia robusta.

---

## Archivos afectados

- `src/app/dashboard/settings/page.tsx:247` — iteración sobre SUPPORTED_CURRENCIES
- `src/lib/store.tsx:283-294` — addCurrency no actualiza budget.currency
- `src/types/index.ts` — interfaz Budget (agregar createdAt?)
- `supabase/migrations/` — nueva migración para agregar created_at

---

## Ejemplo del bug

```
Usuario configura:
1. USD (moneda principal, presupuesto 950)
2. S/ (segunda moneda, sin presupuesto)

Settings muestra (❌ INCORRECTO):
┌─────────────────────────────────┐
│ Soles (S/)         Principal     │
│ S/ [1522]          [Guardar]     │
├─────────────────────────────────┤
│ Dólares ($)        Configurado   │
│ $ [750]            [Guardar]     │
└─────────────────────────────────┘

Settings debería mostrar (✅ CORRECTO):
┌─────────────────────────────────┐
│ Dólares ($)        Principal     │
│ $ [950]            [Guardar]     │
├─────────────────────────────────┤
│ Soles (S/)         Configurado   │
│ S/ [0]             [Guardar]     │
└─────────────────────────────────┘
```

---

## Lecciones aprendidas

1. **No iterar sobre arrays de configuración en orden fijo:** Si el usuario configura monedas en un orden específico, ese orden debe respetarse.
2. **Agregar timestamps de creación:** Todas las entidades que pueden tener orden significativo deberían tener `created_at`.
3. **Validar que budget.currency no cambie al agregar monedas:** Agregar tests para verificar que `addCurrency` no modifica la moneda principal.
4. **JavaScript object order no es confiable para persistencia:** El orden de inserción en objetos JS se mantiene en memoria, pero no necesariamente al serializar/deserializar desde DB.

---

## Referencias

- `docs/bugs/BUG-008_dashboard_soles_ghost.md` — bug relacionado con orden de monedas en dashboard
- `src/app/dashboard/settings/page.tsx:247` — línea problemática
- `src/lib/store.tsx:283-294` — función addCurrency
- `src/types/index.ts` — interfaz Budget
