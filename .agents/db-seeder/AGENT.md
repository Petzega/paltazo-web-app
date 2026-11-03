# DB Seeder Agent — Paltazo

Este directorio contiene las instrucciones y herramientas del agente **db-seeder** para la generación e inserción de datos de prueba aleatorios (gastos e ingresos) en la base de datos de Supabase local (Docker).

## Archivos del agente

- [SKILL.md](./SKILL.md): Especificación completa del agente, reglas de seguridad, parámetros y flujo de trabajo.
- [seed.js](./seed.js): Script en Node.js que consulta la configuración real del usuario (monedas y categorías) y genera transacciones entre 1 y 15 registros por día.

## Uso rápido

```bash
# Para el usuario por defecto (peter@gmail.com, 6 días atrás + hoy = 7 días):
node .agents/db-seeder/seed.js

# Para un usuario específico o diferente cantidad de días:
node .agents/db-seeder/seed.js usuario@correo.com 10
```

