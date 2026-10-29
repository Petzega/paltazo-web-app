# Casos de Uso — Paltazo

> Definición funcional de la app. Cada archivo agrupa los casos de un módulo.
> Los agentes deben implementar estos casos tal cual se describen.

## Visualización

[Abrir la red de casos de uso en Obsidian Canvas](RED_CASOS_DE_USO.canvas): módulos, casos de uso, historias y relaciones en un solo grafo navegable.

## Módulos

| Módulo | Archivo | Casos | Estado |
|--------|---------|-------|--------|
| Autenticación | [`auth/auth.md`](auth/auth.md) | CU-001 a CU-007 | ✅ Implementado |
| Gastos | [`expenses/expenses.md`](expenses/expenses.md) | CU-008 a CU-011 | ✅ Implementado |
| Dashboard | [`dashboard/dashboard.md`](dashboard/dashboard.md) | CU-012 a CU-014 | ✅ Implementado (BUG-001 documentado) |
| Configuración | [`settings/settings.md`](settings/settings.md) | CU-015 a CU-017, CU-022, CU-023 | ✅ Implementado · 📝 2 propuestos |
| Onboarding | [`onboarding/onboarding.md`](onboarding/onboarding.md) | CU-018, CU-021 | ✅ Implementado · 📝 1 propuesto |
| Categorías | [`categories/categories.md`](categories/categories.md) | CU-024 a CU-026 | 📝 PROPUESTO |
| Features futuras | [`future/future.md`](future/future.md) | CU-019, CU-020 | 🔜 Futuro v1.2 |

## Convenciones

- **ID**: CU-XXX secuencial por módulo
- **Severidad de validación**: requerido = bloquea submit, opcional = no bloquea
- **Toast**: notificación temporal (3s por defecto)
- **Modal de confirmación**: obligatorio para acciones destructivas
- **Estado global**: ver `src/lib/store.tsx`
