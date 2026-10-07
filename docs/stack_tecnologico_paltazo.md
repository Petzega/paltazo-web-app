# Stack Tecnológico — Paltazo (paltazo-web-app)

## Visión general
- **Nombre de la app:** Paltazo
- **Nombre del proyecto:** paltazo-web-app
- **Tipo de app:** Progressive Web App (PWA) offline-first
- **Plataformas:** Web responsive + instalable en Android/iOS (sin tienda)
- **Objetivo:** Registro rápido de gastos, presupuesto mensual y alertas de consumo
- **Costo objetivo:** $0/mes durante el MVP, dentro de límites gratuitos

---

## Frontend

### Framework y lenguaje
- **Next.js 15** (App Router)
- **TypeScript** (modo estricto)

### UI y estilos
- **Tailwind CSS**
- **shadcn/ui** o **Radix UI**

### Estado y datos locales
- **Zustand** para estado global simple
- **Dexie.js** como wrapper de IndexedDB para operación offline
- **TanStack Query** para caché, reintentos y sincronización

### PWA
- Elegir **una sola** implementación: `next-pwa` o Workbox
- Web App Manifest
- Web Push API para notificaciones, solo si el usuario concede permiso y la app está bajo HTTPS

---

## Backend

### Decisión del MVP

**Supabase es el único backend del MVP.** Firebase queda como alternativa futura y no debe implementarse en paralelo.

### Supabase Free
- PostgreSQL
- Supabase Auth (email/contraseña y Google OAuth)
- Edge Functions
- Storage solo si se necesita en una fase posterior

> Los límites y condiciones de los planes gratuitos cambian con el tiempo. Verificar las cuotas vigentes antes del despliegue.

---

## Hosting

- **Frontend:** Vercel
- **Backend:** Supabase Cloud
- **Dominio inicial:** `paltazo.vercel.app`
- **Dominio propio opcional:** `paltazo.app`, `paltazo.pe` u otra disponibilidad validada antes de comprar

---

## Base de datos

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_budget NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (monthly_budget >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'food', 'transport', 'services', 'entertainment', 'other'
  )),
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_date
  ON expenses(user_id, expense_date);

CREATE TABLE budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year_month CHAR(7) NOT NULL,
  threshold INTEGER NOT NULL CHECK (threshold IN (80, 100, 101)),
  notified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, year_month, threshold)
);

CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, endpoint)
);
```

> `auth.users` es administrada por Supabase. `profiles` contiene los datos propios de Paltazo; no crear una tabla pública llamada `users`.

---

## Seguridad (RLS)

- Habilitar Row Level Security para `profiles`, `expenses`, `budget_alerts` y `push_subscriptions`.
- Cada usuario autenticado solo puede leer y modificar filas cuyo `user_id` o `id` sea igual a `auth.uid()`.
- Las operaciones administrativas de alertas deben ejecutarse en una Edge Function con credenciales de servidor, nunca exponiendo la service-role key al frontend.

---

## Sincronización offline

1. El usuario registra un gasto y se persiste inmediatamente en IndexedDB.
2. El gasto queda marcado como pendiente de sincronización y posee un identificador local estable.
3. Al recuperar conectividad, una cola sincroniza los gastos pendientes con Supabase.
4. Tras confirmación del servidor, se actualiza el registro local como sincronizado.
5. Si existe conflicto, el servidor es la fuente de verdad; registrar el error y mostrar al usuario un estado claro para reintentar.

---

## Alertas de presupuesto

### Regla

- Calcular el gasto acumulado para el mes de `expense_date`.
- Si `monthly_budget` es `0`, no calcular porcentaje ni emitir alertas de presupuesto.
- Umbrales: 80%, 100% y mayor a 100% (representado internamente como 101).
- Una alerta solo puede enviarse una vez por usuario, mes y umbral. La restricción única en `budget_alerts` garantiza idempotencia.
- Si se edita o elimina un gasto, el dashboard se recalcula. No se reenvían alertas ya emitidas durante el mismo mes.

### Implementación

- El frontend muestra el estado visual inmediatamente.
- Una Edge Function `check-budget` recalcula el total desde PostgreSQL y decide si corresponde registrar/enviar una alerta.
- No asumir que un trigger PostgreSQL puede llamar directamente a una Edge Function HTTP. Definir y probar un mecanismo explícito de invocación.

---

## Estructura de carpetas

```text
paltazo-web-app/
├── app/
│   ├── dashboard/
│   ├── expenses/
│   ├── login/
│   ├── settings/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── BudgetCard.tsx
│   ├── ExpenseForm.tsx
│   ├── ExpenseList.tsx
│   └── AlertBanner.tsx
├── hooks/
│   ├── useBudget.ts
│   └── useExpenses.ts
├── lib/
│   ├── db.ts
│   ├── store.ts
│   └── supabase.ts
├── types/
│   └── index.ts
└── public/
    ├── icons/
    └── manifest.json
```

---

## Identidad visual

- **Primario:** `#8FBC5A`
- **Secundario:** `#4A7C2C`
- **Fondo:** `#FFFFFF`
- **Texto:** `#1A1A1A`
- **Tipografía:** Inter o sans-serif equivalente
- **Escala de espaciado:** 8, 16, 24 y 32 px
- Mobile y desktop comparten tokens y componentes; solo cambia el layout.

---

## Decisiones pendientes

- Definir si las notificaciones push entran al MVP o se limita a alertas visuales dentro de la aplicación.
- Definir la estrategia final de sincronización y resolución de conflictos offline.
- Elegir `next-pwa` o Workbox, no ambos.
- Validar cuotas actuales de Supabase y Vercel antes de producción.
