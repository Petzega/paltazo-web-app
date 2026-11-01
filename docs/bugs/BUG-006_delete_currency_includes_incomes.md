# BUG-006: Eliminar moneda no elimina incomes — Fix: RPC actualizada incluye DELETE FROM incomes

> **Estado:** ✅ Resuelto  
> **Severidad:** Critical (pérdida de datos, inconsistencia)  
> **Fase donde se detectó:** Post-audit (01 nov 2026)  
> **Resuelto:** 01 nov 2026

---

## Resumen

La función atómica `delete_currency_purging_data` eliminaba gastos y presupuestos de una moneda, pero **no eliminaba los ingresos**. Esto causaba que los incomes quedaran huérfanos en Supabase, y al re-sincronizar, reaparecían en el estado local.

**Impacto:**
- Ingresos huérfanos en la base de datos
- Inconsistencia entre estado local y Supabase
- Usuario ve ingresos que creía haber eliminado
- Posibles errores de referencia si se elimina la categoría asociada

---

## Causa raíz

La migración `20261029000005_create_atomic_functions.sql` definió la función `delete_currency_purging_data` con solo dos DELETE:

```sql
-- ❌ ANTES: solo elimina expenses y budgets
DELETE FROM expenses WHERE user_id = p_user_id AND currency = p_currency;
DELETE FROM budgets WHERE user_id = p_user_id AND currency = p_currency;
-- Falta: DELETE FROM incomes WHERE user_id = p_user_id AND currency = p_currency;
```

El código cliente en `store.tsx:removeCurrency()` filtra incomes del estado local, pero Supabase nunca recibe el DELETE correspondiente.

---

## Flujo del bug

```
1. Usuario tiene moneda "€" con 3 incomes registrados
2. Usuario elimina moneda "€" desde settings
3. Cliente llama db.deleteCurrencyWithPurge(userId, "€")
4. RPC elimina expenses + budgets de "€", pero NO incomes
5. Cliente filtra incomes del estado local (setIncomes filter)
6. UI muestra que los incomes fueron eliminados ✓
7. Usuario recarga la página o re-sincroniza
8. loadUserData() trae incomes de Supabase
9. Incomes de "€" reaparecen en el estado ✗
```

---

## Fix aplicado

### Nueva migración: `20261101000002_fix_delete_currency_includes_incomes.sql`

```sql
CREATE OR REPLACE FUNCTION delete_currency_purging_data(
  p_user_id UUID,
  p_currency TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Eliminar gastos de la moneda
  DELETE FROM expenses
  WHERE user_id = p_user_id
    AND currency = p_currency;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- NUEVO: Eliminar ingresos de la moneda
  DELETE FROM incomes
  WHERE user_id = p_user_id
    AND currency = p_currency;
  
  -- Eliminar presupuesto de la moneda
  DELETE FROM budgets
  WHERE user_id = p_user_id
    AND currency = p_currency;
  
  RETURN v_deleted_count;
END;
$$;
```

**Resultado:** Ahora la función elimina expenses, incomes y budgets en una transacción atómica.

---

## Aplicar el fix

```bash
supabase db push
```

Esto reemplazará la función existente con la versión corregida.

---

## Datos huérfanos existentes

Si ya eliminaste monedas antes de este fix, los incomes huérfanos aún existen en Supabase. Para limpiarlos manualmente:

```sql
-- Identificar incomes huérfanos (moneda ya no tiene presupuesto)
SELECT i.id, i.user_id, i.currency, i.amount
FROM incomes i
LEFT JOIN budgets b ON b.user_id = i.user_id AND b.currency = i.currency
WHERE b.id IS NULL;

-- Eliminar incomes huérfanos (revisar antes de ejecutar)
DELETE FROM incomes
WHERE id IN (
  SELECT i.id
  FROM incomes i
  LEFT JOIN budgets b ON b.user_id = i.user_id AND b.currency = i.currency
  WHERE b.id IS NULL
);
```

---

## Archivos afectados

- `supabase/migrations/20261101000002_fix_delete_currency_includes_incomes.sql` (nuevo)
- `supabase/migrations/20261029000005_create_atomic_functions.sql` (referencia, no modificado)
- `src/lib/store.tsx:removeCurrency()` (no requiere cambios, ya filtra incomes localmente)

---

## Lecciones aprendidas

1. **Funciones atómicas deben cubrir TODAS las entidades relacionadas:** Al eliminar una moneda, hay que eliminar expenses, incomes Y budgets. No solo "los principales".
2. **Verificar simetría cliente-servidor:** Si el cliente filtra expenses e incomes, el servidor también debe eliminar ambos.
3. **Migraciones son inmutables:** No se modifica la migración original, se crea una nueva que reemplaza la función con `CREATE OR REPLACE`.
4. **Auditar datos huérfanos:** Este bug puede haber dejado datos inconsistentes en producción. Considerar un script de limpieza.

---

## Referencias

- `src/lib/store.tsx:removeCurrency()` — código cliente que llama a la RPC
- `src/lib/supabase/repositories.ts:deleteCurrencyWithPurge()` — wrapper de la RPC
- `supabase/migrations/20261029000005_create_atomic_functions.sql` — función original (defectuosa)
- Migración similar para categorías: `delete_category_reassigning_expenses` (esta sí es correcta)
