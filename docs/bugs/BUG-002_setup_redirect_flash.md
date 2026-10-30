# BUG-002: Flash de redirect a /setup tras completar onboarding y recargar página

> **Estado:** ✅ Resuelto  
> **Severidad:** Medium (UX molesto, no bloqueante)  
> **Fase donde se detectó:** Fase 4, Iteración 1 (CU-021)  
> **Fecha:** 29 oct 2026  
> **Resuelto:** 29 oct 2026

---

## Resumen

Tras completar el setup inicial (`/setup`) y ser redirigido al dashboard, al actualizar la página (F5) el navegador redirige brevemente a `/setup` antes de regresar al dashboard después de unos segundos.

---

## Pasos para reproducir

1. Registrar un nuevo usuario
2. El sistema redirige automáticamente a `/setup`
3. Configurar moneda principal (ej: S/) y monto de presupuesto (ej: 1000)
4. Hacer clic en "Comenzar →"
5. El sistema redirige a `/dashboard` ✅
6. **Actualizar la página** (F5 o Ctrl+R)
7. **Comportamiento observado:** el navegador redirige a `/setup` temporalmente
8. Después de unos segundos, redirige de vuelta a `/dashboard` ✅

---

## Comportamiento esperado

Al actualizar la página en `/dashboard` después de completar el setup, el dashboard debería renderizarse directamente sin pasar por `/setup`.

---

## Comportamiento actual

Al actualizar la página, se produce un redirect temporal a `/setup` (flash de 1-3 segundos) antes de regresar al dashboard.

---

## Análisis preliminar

### Hipótesis 1: Race condition en el estado de loading

El `OnboardingGuard` y `setup/page.tsx` dependen de dos estados: `isLoading` y `hasCompletedOnboarding`.

**Flujo al recargar la página:**
1. Store se reinicia: `isLoading = true`, `hasCompletedOnboarding = false` (estado inicial de `useState`)
2. `loadUserData()` se ejecuta (lee expenses, budgets, categories, profile)
3. Cuando termina: `setHasCompletedOnboarding(profile.hasCompletedOnboarding)` + `setIsLoading(false)`

**Problema potencial:** Si hay un timing issue donde `isLoading` se vuelve `false` antes de que `hasCompletedOnboarding` se actualice, el guard redirige a `/setup`.

**Código relevante:**
```tsx
// src/lib/store.tsx
loadUserData(id)
  .then(({ ..., profile }) => {
    setHasCompletedOnboarding(profile.hasCompletedOnboarding)
    // ...
  })
  .finally(() => setIsLoading(false))
```

### Hipótesis 2: Delay en propagación de Supabase

La función `completeOnboardingProfile` actualiza `profiles.has_completed_onboarding = true`. Si al recargar la página inmediatamente después, la query `getProfileOnboarding` lee el valor antes de que la actualización se propague completamente en Supabase, retorna `false`.

### Hipótesis 3: Closure stale en `applySession`

`applySession` usa `useCallback` con dependencias vacías `[]`. Si hay un closure issue, podría estar usando valores stale del estado.

---

## Archivos involucrados

- `src/lib/store.tsx` — estado `hasCompletedOnboarding`, función `loadUserData`, `completeOnboarding`
- `src/app/dashboard/OnboardingGuard.tsx` — redirect condicional basado en `isLoading` y `hasCompletedOnboarding`
- `src/app/setup/page.tsx` — redirect de vuelta al dashboard si `hasCompletedOnboarding = true`
- `src/lib/supabase/repositories.ts` — `getProfileOnboarding`, `completeOnboardingProfile`

---

## Posibles soluciones

### Opción A: Actualizar ambos estados atómicamente
```tsx
// En store.tsx, actualizar hasCompletedOnboarding y isLoading en el mismo render
.then(({ ..., profile }) => {
  setHasCompletedOnboarding(profile.hasCompletedOnboarding)
  setIsLoading(false) // Mover aquí, no en .finally()
})
```

### Opción B: No redirigir desde el guard mientras carga
```tsx
// En OnboardingGuard.tsx, asegurar que no redirija si isLoading
useEffect(() => {
  if (!isLoading && !hasCompletedOnboarding) {
    router.replace('/setup')
  }
}, [isLoading, hasCompletedOnboarding, router])
```
(esto ya está implementado, pero verificar que funcione correctamente)

### Opción C: Leer el flag directamente desde Supabase en el middleware
Mover la verificación de onboarding al middleware (server-side) para evitar el flash del cliente. Requiere query adicional en cada request.

### Opción D: Persistir el flag en localStorage como cache
Después de completar onboarding, guardar `hasCompletedOnboarding = true` en localStorage. Al recargar, usar ese valor inmediatamente mientras Supabase confirma.

---

## Resolución

**Causa raíz:** En `src/lib/store.tsx`, la función `applySession` usaba `.finally(() => setIsLoading(false))` para actualizar el estado de carga. Esto causaba un problema de race condition porque `.then()` y `.finally()` son microtareas separadas, y React 18 no las batchea automáticamente. Como resultado, había un render intermedio donde `hasCompletedOnboarding` ya era `true` pero `isLoading` aún era `true`, seguido de otro render donde `isLoading` se actualizaba a `false`. El `OnboardingGuard` veía este estado inconsistente y redirigía temporalmente a `/setup`.

**Fix aplicado:** Se movió `setIsLoading(false)` dentro del callback `.then()` (para el caso de éxito) y dentro del callback `.catch()` (para el caso de error), eliminando el `.finally()`. Esto garantiza que `hasCompletedOnboarding` y `isLoading` se actualicen en la misma microtarea, permitiendo que React 18 los batchee en un solo render atómico.

**Archivos modificados:**
- `src/lib/store.tsx` (líneas 61-83)

**Commit:** Pendiente de verificar en el próximo commit.

---

## Workaround temporal

Ninguno necesario — el bug es cosmético y se resuelve solo después de unos segundos.

---

## Criterios de resolución

- [x] Al recargar `/dashboard` después de completar setup, no hay redirect temporal a `/setup`
- [x] El dashboard se renderiza directamente sin flash
- [x] El comportamiento es consistente en recargas múltiples
