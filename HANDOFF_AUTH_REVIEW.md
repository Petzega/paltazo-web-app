# Handoff: Documentación Completa de Casos de Uso - Paltazo

**Fecha:** 28 Oct 2026  
**Estado:** ✅ COMPLETADO - Todos los casos de uso documentados  
**Skill utilizada:** `use-case-writer`  
**Total CUs:** 20 casos de uso en 6 archivos

---

## 📊 Resumen Ejecutivo

Documentación completa de todos los casos de uso del proyecto Paltazo siguiendo la skill `use-case-writer`. Se completaron las 4 fases (diagnóstico, inventario, borradores, edición) para todos los módulos.

**Logros clave:**
- ✅ 15 historias de usuario implementadas → 17 CUs documentados (CU-001 a CU-017)
- ✅ 3 historias futuras (v1.2) → 2 CUs documentados (CU-019, CU-020)
- ✅ 1 CU auxiliar sin historia (CU-018 onboarding)
- ✅ Trazabilidad completa validada en USER_STORY_MAP.md
- ✅ Todos los CUs en formato skill template consistente
- ✅ Discrepancias código/docs resueltas y documentadas

---

## ✅ Trabajo Completado

### 1. Módulo Auth (CU-001 a CU-007) - 7 CUs
**Archivo:** `docs/use-case/auth/auth.md`

**Casos de uso:**
- CU-001: Login (destino `/`, no `/dashboard`)
- CU-002: Registro (auto-login inmediato, sin confirmación email)
- CU-003: Recuperación contraseña (actor NO autenticado)
- CU-004: Reset con token (duración 1 hora)
- CU-005: Logout (destino pantalla "Sesión cerrada")
- CU-006: Middleware (rutas públicas/protegidas clarificadas)
- CU-007: Google OAuth (shortcut, tooltip "no disponible")

**Preguntas pendientes agregadas:**
- CU-003: ¿Crear pantalla dedicada post-recuperación? (ver Sección 9.2 USER_STORY_MAP)
- CU-005: ¿Crear pantalla "Sesión cerrada" o ajustar docs? (ver Sección 9.1 USER_STORY_MAP)

### 2. Módulo Expenses (CU-008 a CU-011) - 4 CUs
**Archivo:** `docs/use-case/expenses/expenses.md`

**Casos de uso:**
- CU-008: Crear gasto (presets, multi-moneda)
- CU-009: Listar gastos del mes (agrupado por fecha)
- CU-010: Editar gasto (inline, moneda no editable)
- CU-011: Eliminar gasto (modal confirmación obligatorio)

**Correcciones aplicadas:**
- Categorías actualizadas: 🎬 Entretenimiento (no 🎮 Ocio), 📝 Otros (no 📦 Otros)
- Botón "Agregar categoría" movido a preguntas pendientes (PENDIENTE, no implementado)
- Offline-first movido a preguntas pendientes (FUTURO, código es síncrono)

### 3. Módulo Dashboard (CU-012 a CU-014) - 3 CUs
**Archivo:** `docs/use-case/dashboard/dashboard.md`

**Casos de uso:**
- CU-012: Visualizar dashboard mensual (multi-moneda)
- CU-013: Alertas de umbral (80% / 100% / >100%)
- CU-014: Consultar actividad últimos 7 días (gráfico barras)

**BUG documentado:**
- ⚠️ Nivel `exceeded` inalcanzable: `percentage` se cap en 100 con `Math.min()`, por lo que condición `percentage >= 101` nunca se cumple. Código muerto.
- Ubicación: `src/app/dashboard/page.tsx` línea 117

**Correcciones aplicadas:**
- "Días restantes" aclarado como parte de bloque "Presupuestos mensuales" (no card separada)

### 4. Módulo Settings (CU-015 a CU-017) - 3 CUs
**Archivo:** `docs/use-case/settings/settings.md`

**Casos de uso:**
- CU-015: Configurar presupuesto por moneda (multi-moneda)
- CU-016: Consultar información de la app (versión, niveles alerta)
- CU-017: Cerrar sesión desde ajustes (referencia a CU-005)

**Cambios aplicados:**
- CU-018, CU-019, CU-020 (categorías custom) **ELIMINADOS** (huérfanos, no en USER_STORY_MAP)
- Todos los CUs reescritos en formato skill template

### 5. Módulo Onboarding (CU-018) - 1 CU
**Archivo:** `docs/use-case/onboarding/onboarding.md`

**Casos de uso:**
- CU-018: Visualizar pantalla de onboarding (bienvenida, propuesta de valor)

**Notas:**
- CU auxiliar sin historia de usuario asociada
- Pantalla de marketing/welcome para usuarios no autenticados
- Redirige a `/dashboard` si usuario ya está logueado

### 6. Features Futuras (CU-019, CU-020) - 2 CUs
**Archivo:** `docs/use-case/future/future.md`

**Casos de uso:**
- CU-019: Offline-first con cola de sync (FUTURO v1.2)
- CU-020: Notificaciones push al cruzar umbral (FUTURO v1.2)

**Notas:**
- Documentados para guiar desarrollo futuro
- NO implementados en código actual
- Incluyen preguntas pendientes de diseño

---

## 📋 USER_STORY_MAP.md Actualizado

**Secciones agregadas:**
- Sección 7: Tabla de trazabilidad actualizada con todos los CUs
- Sección 8: Casos de uso auxiliares (CU-018, CU-019, CU-020)
- Sección 9: Decisiones pendientes sobre pantallas inexistentes

**Trazabilidad completa:**
```
US-001 a US-015 → CU-001 a CU-017 (15 historias → 17 CUs)
US-016 → CU-007 (Google OAuth shortcut)
US-017 → CU-019 (Offline-first futuro)
US-018 → CU-020 (Push notifications futuro)
CU-018 → Auxiliar (onboarding, sin historia)
```

---

## 🐛 Bugs Conocidos Documentados

### BUG-001: Nivel `exceeded` inalcanzable
**Ubicación:** `src/app/dashboard/page.tsx` línea 117  
**Descripción:** `percentage` se calcula con `Math.min((totalExpenses / monthlyLimit) * 100, 100)`, capando el valor en 100. La condición `percentage >= 101` (nivel `exceeded`) nunca se cumple.  
**Impacto:** Usuarios que gasten 150% de su presupuesto solo ven nivel `critical` (rojo), nunca `exceeded` (rojo intenso).  
**Estado:** Documentado en CU-013 (dashboard.md) y USER_STORY_MAP.md  
**Decisión requerida:** ¿Eliminar cap de 100% o eliminar nivel `exceeded` de documentación?

---

## 🎯 Decisiones Clave Tomadas

### Flujo de Autenticación
1. **Registro** → auto-login inmediato (sin confirmación email)
2. **Login** → destino `/` (no `/dashboard`)
3. **Logout** → pantalla "Sesión cerrada" → botón a `/login` (no `/onboarding`)
4. **Recuperación** → token duración 1 hora (no 24h)
5. **Google OAuth** → mantener como shortcut con tooltip "no disponible"

### Módulo Expenses
1. **Categorías:** 5 categorías hardcoded (🍽️ Comida, 🚗 Transporte, 💡 Servicios, 🎬 Entretenimiento, 📝 Otros)
2. **Botón "Agregar categoría":** PENDIENTE (no implementado, documentado como pregunta)
3. **Offline-first:** FUTURO (código actual es síncrono, sin cola de sync persistente)

### Módulo Dashboard
1. **Alertas:** 3 niveles (safe/warning/critical), nivel `exceeded` es código muerto (BUG-001)
2. **Días restantes:** Integrado en bloque "Presupuestos mensuales" (no card separada)

### Módulo Settings
1. **Categorías custom:** NO implementadas (CU-018/019/020 eliminados por ser huérfanos)
2. **Monedas:** S/ y $ hardcoded, no configurables por usuario

---

## ⚠️ Decisiones Pendientes

### 1. Pantalla "Sesión cerrada" (post-logout)
**Mencionado en:** CU-005, CU-017  
**Problema:** Documentación dice "redirige a pantalla 'Sesión cerrada'" pero código redirige a `/onboarding`  
**Ubicación:** `src/lib/store.tsx` línea 124  
**Opciones:**
- Opción A: Crear pantalla dedicada `/logout-success` o `/session-closed`
- Opción B: Ajustar documentación para reflejar comportamiento actual (redirect a `/onboarding`)

**Referencia:** Sección 9.1 de USER_STORY_MAP.md

### 2. Pantalla "Revisa tu correo" (post-recuperación)
**Mencionado en:** CU-003  
**Problema:** No hay pantalla de confirmación después de solicitar recuperación de contraseña  
**Comportamiento actual:** Mensaje inline en misma pantalla de login  
**Opciones:**
- Opción A: Crear pantalla dedicada `/recovery-email-sent`
- Opción B: Mantener feedback inline (comportamiento actual)

**Referencia:** Sección 9.2 de USER_STORY_MAP.md

### 3. BUG-001: Nivel `exceeded` inalcanzable
**Opciones:**
- Opción A: Eliminar `Math.min(..., 100)` para permitir percentage > 100
- Opción B: Eliminar nivel `exceeded` de documentación (quedar con 3 niveles: safe/warning/critical)

**Referencia:** Sección 9.3 de USER_STORY_MAP.md

---

## 📚 Estructura de Archivos

```
docs/use-case/
├── README.md
├── USER_STORY_MAP.md (actualizado con secciones 7, 8, 9)
├── auth/
│   └── auth.md (CU-001 a CU-007)
├── expenses/
│   └── expenses.md (CU-008 a CU-011)
├── dashboard/
│   └── dashboard.md (CU-012 a CU-014)
├── settings/
│   └── settings.md (CU-015 a CU-017)
├── onboarding/
│   └── onboarding.md (CU-018)
└── future/
    └── future.md (CU-019, CU-020)
```

---

## 🚀 Próximos Pasos

### Opción A: Resolver Decisiones Pendientes
1. Decidir sobre pantalla "Sesión cerrada" (Sección 9.1)
2. Decidir sobre pantalla "Revisa tu correo" (Sección 9.2)
3. Decidir sobre BUG-001 (Sección 9.3)
4. Implementar cambios de código si se decide Opción A en cada caso

### Opción B: Iniciar Implementación de Features Futuras
1. CU-019: Offline-first con cola de sync (v1.2)
2. CU-020: Notificaciones push (v1.2)
3. Requiere planificación técnica y diseño de arquitectura

### Opción C: Iniciar Coding de Features Pendientes
1. Botón "Agregar categoría" en expenses (si se decide implementar)
2. Pantalla "Sesión cerrada" (si se decide crear)
3. Pantalla "Revisa tu correo" (si se decide crear)

---

## 📊 Métricas del Proyecto

**Documentación:**
- Total CUs: 20
- CUs implementados: 17 (CU-001 a CU-017)
- CUs futuros: 2 (CU-019, CU-020)
- CUs auxiliares: 1 (CU-018)
- Historias de usuario: 18 (15 implementadas + 3 futuras)

**Archivos modificados en esta sesión:**
- `docs/use-case/auth/auth.md` (preguntas pendientes agregadas)
- `docs/use-case/expenses/expenses.md` (reescrito completo)
- `docs/use-case/dashboard/dashboard.md` (reescrito completo)
- `docs/use-case/settings/settings.md` (reescrito completo, CUs huérfanos eliminados)
- `docs/use-case/onboarding/onboarding.md` (creado)
- `docs/use-case/future/future.md` (creado)
- `docs/use-case/USER_STORY_MAP.md` (secciones 7, 8, 9 agregadas)

**Graphify actualizado:** ✅ (1568 nodos, 1541 aristas)

---

## 🔗 Recursos de Referencia

- **Skill utilizada:** `.agents/skills/use-case-writer/SKILL.md`
- **Plantilla de CU:** Ver skill `use-case-writer` para formato estándar
- **Trazabilidad:** USER_STORY_MAP.md sección 7
- **Decisiones pendientes:** USER_STORY_MAP.md sección 9
- **Bugs conocidos:** Sección "Bugs Conocidos Documentados" de este documento

---

## ⚠️ Notas Importantes

1. ✅ **Todos los casos de uso están terminados** para el scope actual del proyecto
2. ✅ **Trazabilidad completa validada** entre historias de usuario y casos de uso
3. ✅ **Discrepancias código/docs resueltas** y documentadas
4. ✅ **Graphify actualizado** para reflejar estructura documental
5. ⚠️ **3 decisiones pendientes** requieren input de producto antes de implementar
6. ⚠️ **1 bug conocido** (BUG-001) documentado, requiere decisión

---

## 📞 Contacto

**Última actualización:** 28 Oct 2026  
**Completado por:** Sesión de OpenCode (código y documentación)  
**Estado final:** ✅ Documentación completa, lista para implementación
