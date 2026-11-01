# BUG-005: Tabla push_subscriptions sin RLS — Fix: habilitar RLS y crear policies

> **Estado:** ✅ Resuelto  
> **Severidad:** Critical (privacidad, exposición de claves criptográficas)  
> **Fase donde se detectó:** Post-audit (01 nov 2026)  
> **Resuelto:** 01 nov 2026

---

## Resumen

La tabla `push_subscriptions` fue creada sin Row Level Security (RLS), permitiendo que cualquier usuario autenticado pueda consultar, insertar y eliminar las suscripciones de push de **todos los usuarios**.

**Impacto:**
- Endpoints de push notification expuestos (URLs completas)
- Claves criptográficas p256dh y auth visibles para otros usuarios
- Potencial para enviar notificaciones spam a otros usuarios
- Violación de privacidad

---

## Causa raíz

La migración `20261029000007_create_push_subscriptions.sql` creó la tabla con `UNIQUE(endpoint)` y un índice, pero **nunca ejecutó** `ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY` ni creó policies.

Otras tablas como `expenses`, `budgets`, `categories`, `incomes` sí tienen RLS habilitado con policies apropiadas.

---

## Fix aplicado

### Nueva migración: `20261101000001_fix_push_subscriptions_rls.sql`

```sql
-- Habilitar RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies: cada usuario solo puede ver/insertar/eliminar sus propias suscripciones
CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);
```

**Resultado:** Cada usuario ahora solo puede acceder a sus propias suscripciones de push.

---

## Aplicar el fix

```bash
supabase db push
```

Esto aplicará la nueva migración y habilitará RLS en la tabla existente.

---

## Archivos afectados

- `supabase/migrations/20261101000001_fix_push_subscriptions_rls.sql` (nuevo)
- `supabase/migrations/20261029000007_create_push_subscriptions.sql` (actualizado para futuras instalaciones)

---

## Lecciones aprendidas

1. **Todas las tablas con user_id deben tener RLS:** Sin excepciones, incluso tablas "auxiliares" como push_subscriptions.
2. **Revisar migrations al crear tablas:** Verificar que cada CREATE TABLE tenga su ALTER TABLE ENABLE RLS + policies.
3. **Auditoría de seguridad periódica:** Este bug pasó desapercibido porque la app "funcionaba", pero era una vulnerabilidad crítica.

---

## Referencias

- `src/app/api/notifications/subscribe/route.ts` — endpoint que inserta suscripciones
- `src/lib/store.tsx:subscribeToPush()` — código cliente que llama al endpoint
- Migraciones similares con RLS: `20261009020000_create_budgets.sql`, `20261029000001_create_categories.sql`
