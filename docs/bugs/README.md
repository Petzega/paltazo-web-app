# Bugs Documentados — Paltazo

> Índice de bugs detectados y corregidos en Paltazo. Cada archivo documenta el bug, su causa raíz, fix aplicado y lecciones aprendidas.

## Estado actual

**Total:** 9 bugs documentados  
**Resueltos:** 9/9 (100%)  
**Última actualización:** 01 nov 2026

---

## Lista de bugs

| ID | Título | Severidad | Estado | Fecha |
|----|--------|-----------|--------|-------|
| [BUG-001](BUG-001_dashboard_percentage_cap.md) | Dashboard percentage cap | High | ✅ Resuelto | 29 oct 2026 |
| [BUG-002](BUG-002_setup_redirect_flash.md) | Flash redirect a /setup | Medium | ✅ Resuelto | 29 oct 2026 |
| [BUG-003](BUG-003_date_timezone_utc.md) | Fechas UTC (día anterior) | High | ✅ Resuelto | 31 oct 2026 |
| [BUG-004](BUG-004_remove_primary_currency.md) | No se puede eliminar moneda principal | Medium | ✅ Resuelto | 01 nov 2026 |
| [BUG-005](BUG-005_push_subscriptions_rls.md) | push_subscriptions sin RLS | Critical | ✅ Resuelto | 01 nov 2026 |
| [BUG-006](BUG-006_delete_currency_includes_incomes.md) | Eliminar moneda no elimina incomes | Critical | ✅ Resuelto | 01 nov 2026 |
| [BUG-007](BUG-007_checkBudgetThreshold_UTC.md) | checkBudgetThreshold UTC bug | High | ✅ Resuelto | 01 nov 2026 |
| [BUG-008](BUG-008_dashboard_soles_ghost.md) | Dashboard muestra S/ fantasma | High | ✅ Resuelto | 01 nov 2026 |
| [BUG-009](BUG-009_currency_display_order.md) | Monedas en orden fijo en Settings | Medium | ✅ Resuelto | 01 nov 2026 |

---

## Severidad

- **Critical:** Pérdida de datos, seguridad, privacidad
- **High:** Lógica de negocio incorrecta, UX muy afectada
- **Medium:** UX molesto, no bloqueante
- **Low:** Cosmético, no funcional

---

## Convenciones de documentación

Cada archivo de bug sigue esta estructura:

```markdown
# BUG-XXX: Título — Fix: solución breve

> **Estado:** ✅ Resuelto | 🔄 En progreso | ❌ No resuelto
> **Severidad:** Critical | High | Medium | Low
> **Fase donde se detectó:** [Fase o post-audit]
> **Resuelto:** [fecha]

## Resumen
## Causa raíz
## Fix aplicado
## Ejemplo del bug
## Archivos afectados
## Lecciones aprendidas
## Referencias
```

---

## Cómo documentar un nuevo bug

1. Crear archivo `BUG-XXX_titulo_corto.md` en `docs/bugs/`
2. Seguir la estructura de la plantilla
3. Actualizar este README (agregar fila a la tabla)
4. Actualizar `docs/architecture/CHECKPOINT_2026_10_29.md` (sección "Bugs corregidos")
5. Si el bug afecta un caso de uso, actualizar `docs/use-case/[modulo]/[modulo].md`

---

## Lecciones generales aprendidas

### Fechas y zonas horarias (BUG-003, BUG-007)
- **Nunca usar `new Date(dateString)` con strings date-only:** parsea como UTC, causando off-by-one en zonas horarias negativas
- **Usar `getLocalDate()` para fechas locales:** fuente de verdad en `expenseConstants.ts`
- **Usar `new Date(date + 'T12:00:00')` para parsear fechas de DB:** evita ambigüedad de zona horaria
- **Usar `e.date.startsWith(prefix)` para filtrar por mes:** más seguro que comparar getMonth()/getFullYear()

### Seguridad y RLS (BUG-005)
- **Todas las tablas con user_id deben tener RLS:** sin excepciones, incluso tablas "auxiliares"
- **Revisar migrations al crear tablas:** verificar que cada CREATE TABLE tenga ENABLE RLS + policies

### Eliminación de datos (BUG-004, BUG-006)
- **Funciones atómicas deben cubrir TODAS las entidades relacionadas:** expenses, incomes, budgets
- **Verificar simetría cliente-servidor:** si el cliente filtra, el servidor también debe eliminar
- **Migraciones son inmutables:** usar CREATE OR REPLACE para reemplazar funciones

### Cálculos de negocio (BUG-001)
- **No capar valores de negocio:** el cálculo debe reflejar la realidad, incluso si supera el 100%
- **Testear con casos extremos:** el bug solo aparecía cuando el gasto superaba el presupuesto

---

## Referencias

- [`CHECKPOINT_2026_10_29.md`](../architecture/CHECKPOINT_2026_10_29.md) — estado general del proyecto
- [`docs/use-case/README.md`](../use-case/README.md) — índice de casos de uso
- `.agents/skills/docs-keeper/SKILL.md` — agente para mantener documentación sincronizada
