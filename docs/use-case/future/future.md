# Casos de Uso: Features Futuras (v1.2+)

> Casos de uso planificados pero NO implementados aún. Documentados para guiar desarrollo futuro.

---

## CU-019: Offline-first con cola de sincronización 🔜 FUTURO

### Objetivo
Permitir al usuario registrar gastos sin conexión a internet y sincronizarlos automáticamente cuando la conectividad se restablezca.

### Alcance
Módulo de gastos, persistencia local y sincronización en background.

### Actor principal
Usuario autenticado.

### Fuente
- `USER_STORY_MAP.md` → US-017 (Offline-first con cola de sync)
- **Estado:** NO IMPLEMENTADO (documentado para v1.2)

### Precondiciones
- Usuario autenticado
- Usuario está en `/dashboard/add-expense` o `/dashboard/expenses`
- Dispositivo sin conexión a internet (o con conexión intermitente)

### Disparador
Usuario intenta registrar, editar o eliminar un gasto sin conexión.

### Flujo principal
1. Usuario realiza una operación (crear/editar/eliminar gasto)
2. Sistema detecta que no hay conexión
3. Sistema persiste la operación en IndexedDB con estado `pending`
4. Sistema muestra indicador visual "⚠️ Sin conexión - 1 cambio pendiente"
5. Sistema actualiza UI inmediatamente (estado optimista)
6. Cuando se restablece la conexión:
   - Sistema detecta cambios pendientes en IndexedDB
   - Sistema sincroniza cambios con Supabase en orden (FIFO)
   - Sistema actualiza estado de cada cambio a `synced`
   - Sistema remueve indicador visual
7. Dashboard recalcula totales con datos sincronizados

### Flujos alternativos

**Paso 6 — Conflicto de sincronización:**
- Condición: El gasto fue modificado en otro dispositivo mientras estaba offline
- Comportamiento: Servidor es fuente de verdad. Sistema descarta cambio local y muestra toast "Conflicto resuelto - se usó la versión más reciente"
- Retorno: Estado local se actualiza con versión del servidor

**Paso 6 — Error de sincronización:**
- Condición: Supabase rechaza el cambio (ej: validación de negocio)
- Comportamiento: Sistema mantiene cambio en estado `error` y muestra toast "Error al sincronizar - [motivo]"
- Retorno: Usuario puede reintentar o descartar el cambio

### Excepciones

**Paso 3 - Fallo al persistir en IndexedDB:**
- Condición: IndexedDB lleno o corrupto
- Respuesta: Sistema muestra error crítico "No se pudo guardar localmente" y sugiere al usuario verificar conexión
- Estado final: Operación NO persistida, usuario debe reintentar

### Postcondiciones
- **En éxito:** Operación persistida localmente y sincronizada con Supabase cuando hay conexión
- **En fallo persistente:** Operación en estado `error`, usuario debe decidir si reintentar o descartar

### Reglas de negocio
- Todas las mutaciones (crear/editar/eliminar) deben pasar por cola de sync
- ID local estable para cada operación pendiente (evitar duplicados)
- Orden de sincronización: FIFO (primero en entrar, primero en salir)
- Servidor es fuente de verdad en conflictos
- Indicador visual debe mostrar número de cambios pendientes

### Criterios de aceptación
- ✅ Usuario puede registrar gastos sin conexión
- ✅ Cambios se persisten en IndexedDB inmediatamente
- ✅ Indicador visual muestra "X cambios pendientes"
- ✅ Sincronización automática al recuperar conexión
- ✅ Conflicto resuelto con versión del servidor
- ✅ Error de sincronización notificado al usuario

### Preguntas pendientes
1. **¿Estrategia de sincronización?** FIFO simple o prioridad por tipo de operación (crear > editar > eliminar)
2. **¿Qué pasa si IndexedDB se llena?** ¿Limitar número de cambios pendientes o comprimir datos?
3. **¿Indicador visual persistente?** ¿Mostrar siempre "X cambios pendientes" o solo cuando hay cambios?
4. **¿Reintentos automáticos?** ¿Cuántos reintentos antes de marcar como `error`?

**⚠️ Estado actual:** Store mantiene estado optimista en memoria, pero no hay cola de sync persistente ni indicador visual. Si el usuario recarga la página sin conexión, los cambios se pierden.

---

## CU-020: Notificaciones push al cruzar umbral 🔜 FUTURO

### Objetivo
Enviar notificaciones push al usuario cuando su gasto mensual cruce los umbrales de alerta (80%, 100%, >100%), incluso si la app no está abierta.

### Alcance
Sistema de notificaciones push con Web Push API y Edge Functions.

### Actor principal
Sistema (notifica al usuario).

### Actores secundarios
Usuario autenticado (receptor de notificaciones).

### Fuente
- `USER_STORY_MAP.md` → US-018 (Notificaciones push)
- **Estado:** NO IMPLEMENTADO (documentado para v1.2)

### Precondiciones
- Usuario autenticado
- Usuario tiene presupuesto configurado (`monthlyLimit > 0`)
- Usuario concedió permiso para notificaciones push
- Usuario tiene suscripción push registrada en tabla `push_subscriptions`

### Disparador
Gasto registrado/editado/eliminado que causa cruce de umbral (80%, 100%, >100%).

### Flujo principal
1. Usuario registra gasto (CU-008)
2. Sistema calcula nuevo total mensual en backend (Edge Function)
3. Sistema detecta cruce de umbral (ej: pasó de 75% a 82%)
4. Sistema verifica si ya se envió alerta para este umbral en este mes (tabla `budget_alerts`)
5. Si NO se envió alerta:
   - Sistema registra alerta en `budget_alerts` (idempotencia)
   - Sistema recupera `push_subscriptions` del usuario
   - Sistema envía notificación push a todas las suscripciones activas
   - Push incluye: título, mensaje, ícono, datos (url para deep-link)
6. Usuario recibe notificación en dispositivo
7. Usuario puede hacer clic en notificación para abrir app en dashboard

### Flujos alternativos

**Paso 5 — Usuario ya recibió alerta este mes:**
- Condición: Existe registro en `budget_alerts` para este umbral y mes
- Comportamiento: Sistema NO envía notificación (evita spam)
- Retorno: Flujo termina sin enviar push

**Paso 5 — Usuario sin suscripción push:**
- Condición: Tabla `push_subscriptions` vacía para este usuario
- Comportamiento: Sistema NO envía notificación (pero registra alerta en `budget_alerts` para tracking interno)
- Retorno: Flujo termina sin enviar push

**Paso 7 - Usuario hace clic en notificación:**
- Condición: Notificación incluye `data.url`
- Comportamiento: Sistema abre app en `/dashboard` (o ruta específica si se implementa deep-linking)
- Retorno: Usuario ve dashboard con alerta visual correspondiente

### Excepciones

**Paso 5 - Fallo al enviar push:**
- Condición: Servicio de push (Web Push API) retorna error
- Respuesta: Sistema registra error en logs pero NO reintenta (notificación se perdió)
- Estado final: Alerta registrada en `budget_alerts` pero push NO enviado

**Paso 5 - Suscripción push inválida:**
- Condición: Suscripción expiró o fue revocada por el navegador
- Respuesta: Sistema remueve suscripción inválida de `push_subscriptions` y continúa con las demás
- Estado final: Notificación enviada a suscripciones válidas restantes

### Postcondiciones
- **En éxito:** Usuario recibe notificación push en dispositivo. Alerta registrada en `budget_alerts` para evitar re-notificación.
- **En fallo:** Alerta registrada pero push no enviado. Usuario no recibe notificación este mes para este umbral.

### Reglas de negocio
- Una alerta solo puede enviarse UNA VEZ por usuario, mes y umbral (idempotencia vía `budget_alerts`)
- Si usuario edita/elimina gasto y vuelve a cruzar umbral, NO se re-envía alerta
- Push solo se envía si usuario concedió permiso explícito
- Edge Function usa `service-role key` para acceso a Supabase (nunca exponer al frontend)
- Formato de push: título corto, mensaje claro, ícono de app, deep-link opcional

### Criterios de aceptación
- ✅ Usuario recibe push al cruzar 80%, 100%, >100%
- ✅ Push NO se re-envía si ya se envió este mes para ese umbral
- ✅ Push incluye título, mensaje e ícono
- ✅ Click en push abre app en dashboard
- ✅ Si usuario revocó permiso, sistema limpia suscripciones inválidas
- ✅ Alertas registradas en `budget_alerts` para tracking

### Preguntas pendientes
1. **¿Deep-linking?** ¿Push debe llevar a dashboard general o a moneda específica que cruzó umbral?
2. **¿Hora de envío?** ¿Enviar push inmediatamente o respetar hora silenciosa (ej: no enviar de 10pm a 8am)?
3. **¿Múltiples dispositivos?** Si usuario tiene 3 dispositivos, ¿enviar a todos o solo al activo?
4. **¿Resumen semanal?** ¿Enviar push semanal con resumen de gasto vs presupuesto?

**⚠️ Estado actual:** Alertas son solo visuales en dashboard (CU-013). No hay sistema de notificaciones push ni tabla `budget_alerts` (fue eliminada, ver `stack_tecnologico_paltazo.md`). Si se implementa, se debe re-crear la tabla con migración.

---

## Notas sobre features futuras

**Prioridad sugerida:**
1. **CU-019 (Offline-first):** Alta prioridad. Problema real: usuarios pierden datos si recargan sin conexión.
2. **CU-020 (Push notifications):** Media prioridad. Nice-to-have, pero alertas visuales funcionan bien por ahora.

**Dependencies:**
- CU-019 requiere: Dexie.js (ya en `package.json`), cola de sync persistente, indicador visual
- CU-020 requiere: Edge Function `check-budget`, tabla `budget_alerts` (re-crear), Web Push API, service worker

**Riesgos:**
- **CU-019:** Complejidad de sincronización y resolución de conflictos. Requiere testing exhaustivo.
- **CU-020:** Web Push API no soportada en Safari iOS (solo Chrome/Android). Limitación de plataforma.
