---
name: use-case-writer
description: Revisar, mejorar y generar casos de uso funcionales en español a partir de la documentación y requisitos del proyecto.
---

# Objetivo

Revisar, mejorar y generar casos de uso funcionales en español,
con trazabilidad a los requisitos del proyecto y sin inventar
reglas de negocio.

# Reglas obligatorias

- Leer la documentación y los casos existentes antes de proponer cambios.
- Utilizar requisitos documentados y código existente como fuentes,
  distinguiendo comportamiento previsto de comportamiento implementado.
- No tratar el código como prueba de que una regla de negocio es correcta.
- Si documentación y código se contradicen, informar la diferencia
  y solicitar una decisión. No resolverla silenciosamente.
- No inventar requisitos, actores, permisos ni reglas de negocio.
- Identificar las propuestas como PROPUESTO y la información
  faltante como PENDIENTE.
- Mantener los IDs, nombres y convenciones existentes.
- Preferir cambios puntuales antes que reescribir documentos completos.
- No modificar código de la aplicación.
- No crear ni modificar documentos funcionales sin aprobación
  explícita del alcance y de las rutas.
- Separar casos de uso de casos de prueba.
- Describir objetivos del actor y respuestas observables del sistema,
  no una lista de clics ni detalles de implementación innecesarios.
- No afirmar que existe cobertura completa si quedan decisiones pendientes.

# Flujo de trabajo

## Fase 1: Diagnóstico

1. Localizar y leer las fuentes relevantes para el módulo solicitado.
2. Identificar actores, objetivos, alcance y reglas conocidas.
3. Revisar casos de uso existentes.
4. Presentar:
   - Fuentes consultadas.
   - Problemas de redacción o consistencia.
   - Posibles duplicados.
   - Diferencias entre requisitos e implementación.
   - Posibles casos faltantes y su fundamento.
   - Preguntas de negocio.
5. No editar archivos. Esperar aprobación para continuar.

## Fase 2: Inventario

Presentar una tabla con:
- ID existente o ID propuesto.
- Nombre: verbo en infinitivo y objetivo.
- Actor principal.
- Objetivo.
- Fuente o estado PROPUESTO.
- Estado: existente, por corregir o por redactar.

No asignar prioridades sin fundamento documentado.
Esperar aprobación del inventario antes de redactar.

## Fase 3: Borradores

- Trabajar solo sobre los casos aprobados y por módulo.
- Mostrar primero los borradores en el chat.
- Conservar el formato del proyecto si existe.
- Si no existe, utilizar la plantilla de esta skill.
- No convertir propuestas en requisitos aprobados.
- Esperar aprobación del contenido y de las rutas antes de escribir.

## Fase 4: Edición y verificación

Tras recibir aprobación:
1. Leer nuevamente los archivos que se modificarán.
2. Aplicar únicamente los cambios aprobados.
3. Verificar IDs únicos, referencias y consistencia de términos.
4. Comprobar que no se modificaron archivos fuera del alcance.
5. Resumir cambios y decisiones pendientes.

# Plantilla por defecto

## UC-XXX: Nombre

### Objetivo
Resultado que busca el actor.

### Alcance
Módulo o funcionalidad.

### Actor principal
Actor que inicia el caso.

### Actores secundarios
Solo si corresponde.

### Fuente
Documento y sección, requisito aprobado o referencia al código.
Indicar si describe comportamiento previsto o implementado.

### Precondiciones
Condiciones necesarias antes del inicio.

### Disparador
Evento que inicia el caso.

### Flujo principal
Secuencia numerada de acciones del actor y respuestas del sistema
hasta alcanzar el objetivo.

### Flujos alternativos
Para cada alternativa, indicar:
- Paso del flujo principal del que parte.
- Condición.
- Comportamiento.
- Retorno al flujo o finalización.

### Excepciones
Para cada excepción, indicar:
- Paso afectado.
- Condición de error.
- Respuesta del sistema.
- Estado final conocido o PENDIENTE.

### Postcondiciones
- En éxito.
- En fallo, cuando esté definido.

### Reglas de negocio
Referencias existentes o PENDIENTE.

### Criterios de aceptación
Condiciones observables y verificables.
Usar Gherkin solo si se solicita o el proyecto ya lo utiliza.

### Preguntas pendientes
Decisiones faltantes y su impacto.
