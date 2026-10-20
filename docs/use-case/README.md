# Casos de Uso — Paltazo

> Definición funcional de la app. Cada archivo agrupa los casos de un módulo.
> Los agentes deben implementar estos casos tal cual se describen.

## Módulos

| Módulo | Archivo | Casos | Estado |
|--------|---------|-------|--------|
| Autenticación | [`auth/auth.md`](auth/auth.md) | CU-001 a CU-007 | ✅ Implementado |
| Gastos | [`expenses/expenses.md`](expenses/expenses.md) | CU-008 a CU-011 | ✅ Implementado |
| Dashboard | [`dashboard/dashboard.md`](dashboard/dashboard.md) | CU-012 a CU-014 | ✅ Implementado |
| Configuración | [`settings/settings.md`](settings/settings.md) | CU-015 a CU-017 | ✅ Implementado |

## Convenciones

- **ID**: CU-XXX secuencial por módulo
- **Severidad de validación**: requerido = bloquea submit, opcional = no bloquea
- **Toast**: notificación temporal (3s por defecto)
- **Modal de confirmación**: obligatorio para acciones destructivas
- **Estado global**: ver `src/lib/store.tsx`
