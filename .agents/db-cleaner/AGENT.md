# DB Cleaner Agent — Paltazo

Este directorio contiene las instrucciones y herramientas del agente **db-cleaner** para el borrado y vaciado completo y seguro de la base de datos de Supabase en local (Docker).

## Archivos del agente

- [SKILL.md](./SKILL.md): Especificación completa del agente, reglas innegociables de seguridad, comandos y flujos de verificación.
- [wipe.sh](./wipe.sh): Script ejecutable de borrado automático, purga de Mailpit y verificación de conteo de registros (0 filas).

## Uso rápido

```bash
./.agents/db-cleaner/wipe.sh
```
