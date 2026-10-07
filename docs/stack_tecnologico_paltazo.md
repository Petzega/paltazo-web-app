# Stack Tecnológico — Paltazo (paltazo-web-app)

## Visión general
- **Nombre de la app:** Paltazo
- **Nombre del proyecto:** paltazo-web-app
- **Tipo de app:** Progressive Web App (PWA) offline-first
- **Plataformas:** Web responsive + instalable en Android/iOS (sin tienda)
- **Objetivo:** Registro rápido de gastos, presupuesto mensual, alertas en tiempo real
- **Costo:** $0/mes en tier free (Supabase + Vercel)

---

## Frontend

### Framework y lenguaje
- **Next.js 15** (App Router)
- **TypeScript** (estricto)

### UI y estilos
- **Tailwind CSS** (estilos utilitarios, rápido y ligero)
- **shadcn/ui** o **Radix UI** (componentes accesibles y personalizables)

### Estado y datos locales
- **Zustand** (gestión de estado global simple)
- **Dexie.js** (wrapper de IndexedDB para almacenamiento offline)
- **TanStack Query (React Query)** (caché, reintentos, sincronización)

### PWA
- **next-pwa** o **workbox** (service worker, caché de assets, offline)
- **Web App Manifest** (instalable en Android/iOS)
- **Push Notifications API** (alertas de presupuesto)

---

## Backend (BaaS)

### Opción recomendada: Supabase Free
- **PostgreSQL** (base de datos relacional)
- **Supabase Auth** (registro/login con email, Google, etc.)
- **Storage** (para avatares o adjuntos, si los hubiera)
- **Edge Functions** (alertas de presupuesto, triggers)
- **Límites free:**
  - 500 MB base de datos
  - 1 GB storage
  - 50K usuarios activos mensuales
  - **Proyecto se pausa tras 7 días de inactividad**

### Opción alternativa: Firebase Spark
- **Firestore** (NoSQL)
- **Firebase Auth**
- **Cloud Functions** (alertas)
- **Límites free:**
  - 1 GB storage
  - 50K lecturas/día
  - 20K escrituras/día
  - Sin pausa por inactividad

---

## Hosting y despliegue

### Frontend
- **Vercel** (free tier generoso para Next.js)
  - Dominio: `paltazo.vercel.app` (gratis)
  - Deploy automático desde GitHub

### Backend
- **Supabase Cloud** (free) o **Firebase** (free Spark)

### Dominio personalizado (opcional)
- Compra de dominio: ~$10–15/año (Namecheap, Porkbun, etc.)
- Dominio sugerido: `paltazo.app`, `paltazo.io`, `paltazo.pe`

---

## Esquema de base de datos (Supabase/PostgreSQL)

```sql
-- Tabla: users (extendida desde auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  monthly_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PEN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas rápidas por usuario y mes
CREATE INDEX idx_expenses_user_month ON expenses(user_id, expense_date);
```

---

## Flujo de sincronización offline → online

1. Usuario registra gasto → se guarda en **IndexedDB (Dexie.js)** inmediatamente
2. Service worker detecta conexión → envía cola de gastos pendientes a Supabase
3. Supabase responde → se limpia IndexedDB y se actualiza estado local (Zustand + React Query)

---

## Alertas de presupuesto

### Trigger en Edge Function (Supabase)
```ts
// Cada vez que se inserta un gasto:
// 1. Sumar gastos del mes actual del usuario
// 2. Comparar con monthly_budget
// 3. Si >= 80%, 100%, >100% → enviar push notification o email
```

### Notificaciones push (PWA)
- Usar **Web Push API** + **VAPID keys**
- Suscribirse desde el frontend y guardar `push_subscription` en Supabase
- Edge Function envía notificación cuando se supera el umbral

---

## Estructura de carpetas (Next.js App Router)

```
paltazo-web-app/
├── /app
│   ├── /api             # Rutas de API (si las hubiera)
│   ├── /dashboard       # Vista principal con gastos y presupuesto
│   ├── /login           # Autenticación
│   ├── /settings        # Configurar presupuesto mensual
│   ├── layout.tsx       # Layout global
│   └── page.tsx         # Landing o redirect a dashboard
├── /components          # Componentes reutilizables (shadcn/ui)
├── /lib
│   ├── supabase.ts      # Cliente de Supabase
│   ├── db.ts            # Dexie.js (IndexedDB)
│   └── store.ts         # Zustand (estado global)
├── /hooks               # Custom hooks (useExpenses, useBudget, etc.)
├── /types               # Tipos TypeScript
├── /public
│   ├── manifest.json    # Web App Manifest
│   └── icons/           # Íconos para PWA (paltazo-icon-*.png)
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Comandos iniciales (setup)

```bash
# Crear proyecto Next.js
npx create-next-app@latest paltazo-web-app --typescript --tailwind --app --eslint

cd paltazo-web-app

# Instalar dependencias clave
npm install @supabase/supabase-js @supabase/ssr
npm install dexie
npm install zustand @tanstack/react-query
npm install next-pwa
npm install lucide-react # íconos

# Inicializar shadcn/ui (opcional)
npx shadcn@latest init
```

---

## Identidad visual (sugerencias)

- **Logo:** Ícono de palta (aguacate) minimalista + tipografía sans-serif
- **Colores:** Verde palta (#8FBC5A), verde oscuro (#4A7C2C), blanco, gris neutro
- **Tono:** Casual, peruano, cercano ("paltazo" = gasto sorpresa, como que te cayó una palta)

---

## Costo estimado (tier free)

| Servicio | Plan | Límites | Costo |
|----------|------|---------|-------|
| Vercel | Free | 100 GB/mes bandwidth, 1000 horas de serverless | $0 |
| Supabase | Free | 500 MB DB, 1 GB storage, 50K MAU | $0 |
| Dominio | Opcional | — | ~$10–15/año |

**Total:** $0/mes (mientras estés bajo los límites free)

---

## Advertencias

- **Supabase free pausa proyectos tras 7 días sin actividad.** Si no la usas seguido, se duerme y hay que reactivar manualmente.
- **Firebase puede tener costos sorpresa** si hay picos de lecturas/escrituras (facturación por uso).
- **PWA no está en Play Store/App Store** por defecto. Puedes publicar como TWA (Trusted Web Activity) en Android o usar PWA Builder, pero requiere configuración extra.

---

## Siguientes pasos

1. **Prototipo local:** Next.js + Tailwind + formulario de gastos + IndexedDB (sin backend aún)
2. **Integra Supabase:** Auth + tabla `expenses` + sync offline→online
3. **PWA:** Manifest, service worker, instalación
4. **Alertas:** Edge Function que sume gastos del mes y dispare notificación si ≥ 80%, 100%, >100% del presupuesto
5. **Deploy:** Vercel (frontend) + Supabase (backend)
6. **Branding:** Diseñar logo de palta, íconos PWA, favicon
