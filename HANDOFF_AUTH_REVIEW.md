# Handoff: Revisión de Casos de Uso - Módulo Auth

**Fecha:** 28 Oct 2026  
**Estado:** Fase 4 en progreso (25% completada)  
**Skill utilizada:** `use-case-writer`

---

## Resumen Ejecutivo

Revisión completa del módulo de autenticación siguiendo la skill `use-case-writer`. Se completaron las Fases 1-3 (diagnóstico, inventario, borradores) y se inició la Fase 4 (escritura en archivos).

**Decisión clave:** Se validó y reestructuró todo el módulo auth para alinear documentación con comportamiento real del código.

---

## ✅ Trabajo Completado

### 1. `docs/use-case/auth/auth.md` (COMPLETO)
- **7 casos de uso reescritos** (CU-001 a CU-007) siguiendo plantilla de skill
- **Anexo "Notas técnicas"** actualizado
- **Bloque "Decisiones pendientes"** añadido con 5 puntos críticos

**Cambios principales:**
- CU-001: Login - destino corregido a `/` (no `/dashboard`)
- CU-002: Registro - auto-login inmediato, sin confirmación email
- CU-003: Recuperación - actor corregido (usuario NO autenticado)
- CU-004: Reset - duración token explícita (1 hora)
- CU-005: Logout - destino a pantalla "Sesión cerrada" (no `/onboarding`)
- CU-006: Middleware - rutas públicas/protegidas clarificadas
- CU-007: Google OAuth - añadido tooltip "no disponible"

### 2. `docs/use-case/settings/settings.md` (COMPLETO)
- **CU-017 reducido** de ~40 líneas a referencia corta (~10 líneas)
- Ahora apunta a CU-005 como fuente de verdad
- Destino post-logout corregido: pantalla "Sesión cerrada"

**Nota:** Se detectaron CU-018, CU-019, CU-020 (gestión de categorías) que no estaban en el README original. No se tocaron por estar fuera del scope.

---

## ⏳ Trabajo Pendiente

### 3. `docs/use-case/USER_STORY_MAP.md` (5 correcciones pendientes)

Aplicar estas ediciones quirúrgicas:

```markdown
### Corrección 1: US-001 (líneas ~61-67)
ELIMINAR:
- [ ] Si requiere confirmación de email → mensaje "Revisa tu correo..."

REEMPLAZAR con:
- [ ] Auto-login inmediato tras registro exitoso (sin confirmación email)

### Corrección 2: US-002 (línea ~79)
CAMBIAR:
- [ ] Credenciales válidas → redirige a `/dashboard`
POR:
- [ ] Credenciales válidas → redirige a `/` (dashboard)

### Corrección 3: US-004 (línea ~113)
CAMBIAR:
- [ ] Redirige a `/onboarding`
POR:
- [ ] Redirige a pantalla "Sesión cerrada" (con botón a `/login`)

### Corrección 4: US-015 (línea ~320)
AÑADIR al final:
(mismo flujo que CU-005)

### Corrección 5: Release 3 (línea ~47)
CAMBIAR:
│ [US-017] [US-018] [US-019]
POR:
│ [US-016] [US-017] [US-018]
```

### 4. `docs/stack_tecnologico_paltazo.md` (3 cambios pendientes)

```markdown
### Cambio 1: Añadir tabla budgets (después de tabla profiles, ~línea 69)
INSERTAR:

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  monthly_limit NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, currency)
);

### Cambio 2: Añadir nota post-bloque SQL (~línea 103)
INSERTAR:

> El trigger `handle_new_user` inserta automáticamente:
> - Un registro en `profiles` con `primary_currency = 'PEN'`
> - Un registro en `budgets` con `monthly_limit = 1000`, `currency = 'PEN'`

### Cambio 3: Actualizar duración de token (~línea 135)
CAMBIAR:
- **Tokens de recuperación:** 24 horas
POR:
- **Tokens de recuperación:** 1 hora (configurable en Supabase Dashboard)
```

---

## 🎯 Decisiones Clave Tomadas

### Flujo de Autenticación
1. **Registro** → auto-login inmediato (sin confirmación email)
2. **Login** → destino `/` (no `/dashboard`)
3. **Logout** → pantalla "Sesión cerrada" → botón a `/login` (no `/onboarding`)
4. **Recuperación** → token duración 1 hora (no 24h)
5. **Google OAuth** → mantener como shortcut con tooltip "no disponible"

### Esquema de Datos
- **Tabla `budgets` existe** (multi-moneda, no solo `profiles.monthly_budget`)
- **Discrepancia de moneda:** documentación usa `'PEN'`, código usa `'S/'` → se decidió mantener `'PEN'` en docs
- **Trigger tolerante:** `handle_new_user` permite usuarios sin perfil/budget (documentado como pendiente)

### Sesión y Middleware
- **Sesión expirada** → redirect silencioso a `/login` (datos en curso se pierden)
- **Rutas públicas:** solo `/login` y `/onboarding`
- **Ruta `/`** → protegida (no pública)

### Documentación
- **Formato:** plantilla de skill `use-case-writer` (no formato libre)
- **BUG-XXX** → mantener en cuerpo de casos de uso
- **CU-017** → convertir en referencia a CU-005 (no duplicar)

---

## 📋 Pendientes Tangenciales (Documentados en auth.md)

1. **Naming `/`:** ¿"dashboard" o "home"? → decidir en módulo dashboard
2. **Ruta "Sesión cerrada":** ¿`/logout-success`, `/session-closed`, `/goodbye`? → decisión de routing
3. **Rol admin:** mencionado pero fuera de MVP → definir scope cuando corresponda
4. **Discrepancia `'PEN'` vs `'S/'`:** alinear código con documentación eventualmente
5. **Trigger tolerante:** decidir si endurecer `handle_new_user` para evitar usuarios huérfanos

---

## 🚀 Instrucciones para Continuar

### Opción A: Completar Fase 4 Rápido
```bash
# 1. Aplicar las 5 correcciones a USER_STORY_MAP.md (ver sección "Trabajo Pendiente")
# 2. Aplicar los 3 cambios a stack_tecnologico_paltazo.md (ver sección "Trabajo Pendiente")
# 3. Ejecutar graphify update
graphify update .
```

### Opción B: Revisar Antes de Continuar
1. Leer `docs/use-case/auth/auth.md` para validar cambios
2. Leer `docs/use-case/settings/settings.md` para validar CU-017 reducido
3. Si todo OK, proceder con Opción A

### Opción C: Revertir Todo
```bash
git checkout docs/use-case/auth/auth.md
git checkout docs/use-case/settings/settings.md
```

---

## 📚 Archivos de Referencia

- **Skill usada:** `.agents/skills/use-case-writer/SKILL.md`
- **Inventario aprobado:** ver conversación completa (Fase 2)
- **Borradores aprobados:** ver conversación completa (Fase 3)
- **Cuestionario de decisiones:** 16 preguntas respondidas por el usuario

---

## ⚠️ Notas Importantes

1. **No se generó código**, solo documentación de casos de uso
2. **No se ejecutaron tests** (no había que validar comportamiento)
3. **Graphify no se actualizó** todavía (pendiente al final de Fase 4)
4. **Los cambios son documentales**, no afectan comportamiento de la app
5. **Las decisiones están justificadas** en la conversación completa

---

## 🔗 Contexto Adicional

**¿Por qué se hizo esto?**
- Documentación de auth estaba desalineada con código real
- Había contradicciones (ej: `/` como pública pero protegida)
- Faltaba claridad en flujos críticos (logout, recuperación)
- Se necesitaba base sólida para futuros desarrollos (rol admin, OAuth)

**¿Qué sigue después de Fase 4?**
- Actualizar graphify para reflejar nueva estructura documental
- Considerar revisión de otros módulos (expenses, dashboard) con misma metodología
- Planificar implementación de pendientes tangenciales si corresponde

---

**Última actualización:** 28 Oct 2026  
**Contacto:** Revisar conversación completa en sesión de OpenCode
