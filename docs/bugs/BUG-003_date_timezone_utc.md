# BUG-003: Fechas mostradas como día anterior por zona horaria UTC

> **Estado:** ✅ Resuelto
> **Severidad:** High (datos incorrectos, afecta registros de gastos)
> **Fase donde se detectó:** Post-audit, iteración de mejoras
> **Fecha:** 31 oct 2026
> **Resuelto:** 31 oct 2026

---

## Resumen

Todas las fechas en la aplicación se parseaban usando `new Date().toISOString()` o `new Date(dateString)`, lo que genera desfases de día en zonas horarias UTC-5 (Perú) cuando son las 7pm o más tarde (hora local). El día mostrado era siempre el anterior al real.

**Impacto:**
- Fecha por defecto en formulario de gasto/ingreso: día incorrecto
- Fecha en DatePicker: "Hoy" marcado en día equivocado
- Fecha mostrada en lista de gastos/ingresos: día anterior
- Bar chart del dashboard: agrupamiento por día incorrecto

---

## Pasos para reproducir

1. Configurar zona horaria del sistema en UTC-5 (Perú) o cualquier UTC-N
2. Esperar a que sean las 19:00 o más tarde (hora local)
3. Abrir la app y navegar a "Nuevo Gasto"
4. **Comportamiento observado:**
   - El campo "Fecha del gasto" muestra el día de mañana (en UTC ya es otro día)
   - El DatePicker marca como "Hoy" un día incorrecto
   - Al guardar, el gasto se registra con fecha incorrecta en Supabase

---

## Comportamiento esperado

La fecha debe reflejar siempre el día local del usuario, sin importar la zona horaria ni la hora del día.

---

## Comportamiento actual (antes del fix)

- `new Date().toISOString().split('T')[0]` → devuelve fecha UTC
- `new Date("2026-10-31")` → se parsea como UTC midnight → en UTC-5 = `Oct 30 19:00` → muestra "30"
- DatePicker: `today = new Date()` → `getMonth()/getDate()` en UTC → día incorrecto
- Dashboard bar chart: agrupamiento por día usando UTC → gastos de hoy aparecen en ayer

---

## Causa raíz

**Doble problema:**

### Problema 1: `toISOString()` devuelve UTC
```ts
// ❌ ANTES: devuelve "2026-11-01" si son las 10pm en Perú
new Date().toISOString().split('T')[0]

// ✅ DESPUÉS: devuelve "2026-10-31" usando hora local
const d = new Date()
`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
```

### Problema 2: `new Date(string)` sin hora se parsea como UTC
```ts
// ❌ ANTES: "2026-10-31" → UTC midnight → en UTC-5 = Oct 30 19:00
new Date("2026-10-31").toLocaleDateString('es-PE')

// ✅ DESPUÉS: fuerza hora del mediodía para evitar desfase UTC
new Date("2026-10-31T12:00:00").toLocaleDateString('es-PE')
```

### Problema 3 (DatePicker): Anti-pattern de React
```ts
// ❌ ANTES: setViewMonth durante el render sobrescribía la navegación
if (parsed.year !== viewYear || parsed.month !== viewMonth) {
  setViewYear(parsed.year)
  setViewMonth(parsed.month)
}

// ✅ DESPUÉS: useEffect solo se dispara cuando value cambia externamente
useEffect(() => {
  const { year, month } = parseDate(value)
  setViewYear(year)
  setViewMonth(month)
}, [value])
```

---

## Archivos afectados y fixes aplicados

### 1. `src/lib/expenseConstants.ts`
- **Agregado:** función `getLocalDate()` que retorna `YYYY-MM-DD` en zona horaria local

### 2. `src/app/dashboard/add-expense/page.tsx`
- **Línea 23:** `useState(new Date().toISOString().split('T')[0])` → `useState(getLocalDate())`
- **Línea 97:** `setDate(new Date().toISOString().split('T')[0])` → `setDate(getLocalDate())`
- **Línea 328:** `new Date(date)` → `new Date(date + 'T12:00:00')`

### 3. `src/app/dashboard/add-income/page.tsx`
- **Línea 22:** `useState(new Date().toISOString().split('T')[0])` → `useState(getLocalDate())`
- **Línea 96:** `setDate(new Date().toISOString().split('T')[0])` → `setDate(getLocalDate())`
- **Línea 307:** `new Date(date)` → `new Date(date + 'T12:00:00')`

### 4. `src/app/dashboard/expenses/page.tsx`
- **Línea 187:** `new Date(expense.date)` → `new Date(expense.date + 'T12:00:00')`

### 5. `src/app/dashboard/incomes/page.tsx`
- **Línea 183:** `new Date(income.date)` → `new Date(income.date + 'T12:00:00')`

### 6. `src/app/dashboard/page.tsx`
- **Línea 265:** `now.toISOString().split('T')[0]` → `getLocalDate()`
- **Línea 273:** `d.toISOString().split('T')[0]` → formato local explícito

### 7. `src/components/ui/DatePicker.tsx`
- **Línea 26-28:** Agregada función `getLocalToday()` que usa `getFullYear/getMonth/getDate` (zona local)
- **Línea 40-44:** Reemplazado `if` durante render por `useEffect` con dependencia en `value`
- **Línea 51-66:** Grid con `{year, month, day}` explícitos por celda (elimina heurística `day > 15`)

---

## Regla general para fechas en Paltazo

**Nunca usar:**
- `new Date().toISOString().split('T')[0]`
- `new Date("YYYY-MM-DD")` sin hora explícita
- `date.toISOString()` para mostrar al usuario

**Siempre usar:**
- `getLocalDate()` para inicializar fechas (zona horaria local)
- `new Date(dateString + 'T12:00:00')` para parsear fechas de DB (evita desfase UTC)
- `date.getFullYear/getMonth/getDate()` para obtener componentes de fecha local

---

## Tests manuales realizados

- [x] Abrir formulario de gasto a las 10pm en UTC-5 → fecha por defecto es hoy (correcto)
- [x] DatePicker marca el día actual como "Hoy" (correcto)
- [x] Navegación con flechas ‹ › entre meses funciona sin límites
- [x] Seleccionar fecha de mes/año anterior funciona correctamente
- [x] Fecha mostrada en lista de gastos coincide con fecha registrada
- [x] Bar chart del dashboard agrupa gastos por día local correcto
- [x] `handleClear()` resetea fecha a hoy (correcto)

---

## Lecciones aprendidas

1. **JavaScript `Date` es UTC por defecto:** `toISOString()`, `new Date(string)` sin hora, y `Date.parse()` trabajan en UTC. Solo `getFullYear/getMonth/getDate/getHours` devuelven valores locales.

2. **El patrón `toISOString().split('T')[0]` es una trampa común:** parece devolver "hoy" pero en realidad devuelve "hoy en UTC", que puede ser ayer o mañana según la zona horaria.

3. **React `useEffect` vs render-time state updates:** Hacer `setState` durante el render (sin `useEffect`) causa loops infinitos o sobrescritura de cambios legítimos. Siempre usar `useEffect` con dependencias explícitas.

4. **Fechas en DB siempre sin zona horaria:** El formato `YYYY-MM-DD` no tiene información de zona horaria. Al parsearlo, siempre agregar `T12:00:00` para forzar zona local y evitar desfases.

---

## Referencias

- [MDN: Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MDN: toISOString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString)
- [W3C: Date and Time Formats](https://www.w3.org/TR/NOTE-datetime)
