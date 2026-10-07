# Paltazo Web App

- Responde siempre en español.
- Sé directo y conciso: elimina cortesías, preámbulos y conclusiones redundantes.

## Eficiencia y contexto

- Para preguntas sobre arquitectura, dependencias y flujo de código, consulta primero Graphify.
- No explores el repositorio completo salvo que sea indispensable o se solicite explícitamente.
- Lee estrictamente los archivos necesarios para resolver la tarea.
- Prefiere comandos, búsquedas y validaciones limitados al área afectada.
- La salida de comandos debe mantenerse mínima; RTK comprime automáticamente la salida de shell.
- No ejecutes builds, suites de prueba completas ni linters globales sin necesidad o autorización explícita.
- Cuando utilices la integración MCP de Stitch, tienes estrictamente prohibido usar WebFetch para intentar descargar imágenes de Google. Basa tu análisis de diseño únicamente en el DOM/JSON devuelto por el proxy y en los assets locales.

## Cambio seguro y minimalismo

- Antes de editar, presenta un plan de máximo 5 viñetas y espera aprobación explícita.
- Indica los archivos mínimos que necesitarías revisar o modificar antes de realizar cambios.
- No modifiques más de 3 archivos por iteración sin aprobación explícita.
- No agregues dependencias, abstracciones prematuras, configuración ni infraestructura sin una necesidad demostrable y aprobación.
- Prioriza soluciones nativas del navegador y la plataforma —HTML, CSS, JavaScript y APIs estándar— antes de sugerir paquetes npm.
- Prefiere la solución mínima compatible con el código existente, sin comprometer validación, seguridad ni accesibilidad.

## Validación y cierre

- Ejecuta solo la validación relacionada con el cambio: test, lint, typecheck o build específico.
- Tras modificar código, ejecuta `graphify update .` para mantener el grafo actualizado.
- Resume en máximo 6 viñetas: archivos modificados, validaciones realizadas, resultado y pendientes.

## Graphify

This project has a knowledge graph at `graphify-out/` with structural relationships across the codebase.

Rules:

- For codebase questions, first run `graphify query "<question>"` when `graphify-out/graph.json` exists.
- Use `graphify path "<A>" "<B>"` to inspect relationships between components.
- Use `graphify explain "<concept>"` for focused context about a concept, file, module, class, function, route, or component.
- Prefer Graphify query/path/explain results over raw `grep`, `rg`, `find`, broad directory listings, or reading multiple source files.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation before reading source files.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain do not provide enough context.
- Dirty files inside `graphify-out/` are expected after hooks or incremental updates; do not skip Graphify because those files are dirty.
- Skip Graphify only if the task concerns stale/incorrect graph output or the user explicitly asks not to use it.
- After modifying code, run `graphify update .` to keep the graph current. This is AST-local and does not consume model API tokens.