# Necesidad del Proyecto — Paltazo

## Resumen

**Paltazo** es una Progressive Web App (PWA) para que una persona registre sus gastos diarios en el momento en que ocurren, controle un presupuesto mensual y reciba alertas antes de excederlo.

El problema no es la ausencia de información financiera, sino la falta de registro oportuno y de visibilidad simple sobre cuánto dinero queda disponible durante el mes.

---

## Problema a resolver

Las personas suelen anotar sus gastos tarde, de forma incompleta o en distintos lugares: memoria, notas, chats, hojas de cálculo o aplicaciones complejas. Como resultado, pierden visibilidad de su gasto acumulado y descubren demasiado tarde que han alcanzado o superado su presupuesto mensual.

Las soluciones existentes suelen presentar una o varias de estas fricciones:

- Requieren demasiados campos o pasos para registrar un gasto simple.
- Priorizan reportes complejos en lugar de registrar el gasto en segundos.
- No funcionan correctamente sin conexión o dependen completamente de Internet.
- No tienen una experiencia uniforme entre celular y navegador web.
- Alertan tarde, cuando el presupuesto ya fue superado.
- Exigen pagos, publicidad invasiva o una configuración inicial excesiva.

---

## Necesidad principal

Se necesita una aplicación personal, rápida y de bajo costo que permita registrar gastos al instante desde móvil o web, consolidarlos por mes y comunicar de forma clara el estado del presupuesto.

La aplicación debe priorizar el hábito de registro: mientras menos pasos tome guardar un gasto, mayor será la probabilidad de que los datos reflejen el consumo real.

---

## Usuario objetivo

### Usuario principal

Persona que administra sus gastos personales y necesita saber, durante el mes, cuánto ha gastado y cuánto presupuesto le queda.

### Contexto de uso

- Registra compras pequeñas y frecuentes: comida, transporte, servicios, entretenimiento y otros.
- Usa principalmente un teléfono, pero también necesita consultar o administrar información desde una computadora.
- Puede estar temporalmente sin Internet cuando realiza un gasto.
- No busca contabilidad empresarial ni asesoría financiera; busca control práctico de su presupuesto personal.

---

## Objetivo del producto

Permitir que el usuario mantenga el control de su gasto mensual mediante registro inmediato, seguimiento visual del presupuesto y alertas preventivas.

### Objetivos específicos

- Registrar un gasto en pocos segundos.
- Configurar un monto máximo de gasto mensual y una moneda.
- Mostrar gasto acumulado, monto restante y porcentaje consumido del presupuesto.
- Alertar al usuario al llegar a umbrales configurables: 80%, 100% y más de 100%.
- Mantener la información disponible desde móvil y web con una identidad visual consistente.
- Funcionar offline para registrar gastos y sincronizar los datos cuando vuelva la conexión.
- Mantener el costo operativo cercano a cero para un MVP personal.

---

## Propuesta de valor

**Paltazo ayuda a detectar el “paltazo” antes de que ocurra:** convierte cada gasto cotidiano en una señal visible contra el presupuesto mensual, sin formularios pesados ni dependencia permanente de Internet.

La propuesta no es reemplazar un banco, una plataforma contable ni una app de inversiones. Es una herramienta de control diario enfocada en una sola pregunta:

> ¿Cuánto he gastado este mes y cuánto me queda antes de pasar mi límite?

---

## Alcance del MVP

### Incluido

- Registro, edición y eliminación de gastos.
- Campos de gasto: monto, categoría, descripción opcional y fecha.
- Categorías iniciales: comida, transporte, servicios, ocio y otros.
- Configuración de presupuesto mensual y moneda.
- Dashboard mensual con presupuesto, gasto acumulado, saldo disponible y barra de progreso.
- Historial de gastos del mes.
- Alertas visuales al 80%, 100% y al superar el 100% del presupuesto.
- Autenticación para proteger y sincronizar datos personales.
- Experiencia responsive para mobile y desktop con los mismos estilos y componentes.
- Soporte offline-first: guardar localmente y sincronizar al recuperar conectividad.

### Fuera de alcance inicial

- Conexión automática con bancos, tarjetas o billeteras digitales.
- Gestión de inversiones, deudas, créditos o patrimonio.
- Contabilidad empresarial, facturación o declaraciones tributarias.
- Presupuestos compartidos entre varios usuarios.
- Múltiples presupuestos por categoría.
- Predicciones de gasto con IA.
- Publicación obligatoria en App Store o Google Play; inicialmente será instalable como PWA.

---

## Flujo principal

1. El usuario inicia sesión y configura su presupuesto mensual.
2. Realiza un gasto y abre Paltazo desde el celular o navegador.
3. Registra monto, categoría, descripción opcional y fecha.
4. La app guarda el gasto inmediatamente, incluso sin conexión.
5. El dashboard recalcula el gasto mensual, el saldo disponible y el porcentaje usado.
6. Si se alcanza un umbral, Paltazo muestra una alerta visible y, cuando corresponda, una notificación push.
7. Al recuperar conexión, los cambios pendientes se sincronizan de forma segura.

---

## Requisitos de experiencia

- El formulario de nuevo gasto debe requerir como mínimo: monto y categoría.
- El registro debe sentirse inmediato: sin pantallas de carga innecesarias ni esperas por red.
- El dashboard debe responder la situación mensual en menos de una mirada: presupuesto, gastado, restante y estado.
- Mobile y web deben usar los mismos colores, tipografía, espaciado y componentes; cambia el layout, no la identidad visual.
- El diseño debe ser claro, sobrio y cercano; no debe trivializar ni juzgar el gasto del usuario.
- Debe existir un estado visible para registros pendientes de sincronización si el usuario está offline.

---

## Criterios de éxito del MVP

- Un usuario puede registrar un gasto en menos de 15 segundos.
- El dashboard muestra correctamente el total mensual y el saldo restante después de cada registro.
- Las alertas se activan una sola vez por cada umbral mensual, evitando notificaciones repetitivas.
- Un gasto registrado sin conexión se conserva localmente y se sincroniza al volver a tener Internet.
- La interfaz es usable en viewport mobile y desktop sin duplicar estilos ni funcionalidades.
- El proyecto puede operar dentro de los límites gratuitos del stack definido para el MVP.

---

## Restricciones técnicas y de negocio

- El MVP debe minimizar costos recurrentes y preferir servicios con nivel gratuito.
- Debe ser una web app responsive e instalable como PWA; no se desarrollarán apps nativas separadas en la primera etapa.
- Los datos financieros son personales: cada usuario solo puede acceder a sus propios gastos y presupuesto.
- El producto debe ser rápido aun en redes móviles inestables, por lo que offline-first no es opcional.

---

## Prompt de agente de producto

```text
Eres un Product Manager senior para Paltazo, una PWA de control de gastos personales. Tu responsabilidad es mantener el producto enfocado en resolver una necesidad concreta: permitir que una persona registre gastos diarios de inmediato, controle un presupuesto mensual y reciba alertas antes de alcanzarlo o superarlo.

Contexto:
- Paltazo funciona en móvil y web responsive con los mismos estilos visuales; solo cambia el layout según el viewport.
- El usuario necesita registrar gastos rápido, incluso sin Internet.
- La aplicación debe ser offline-first: guarda localmente y sincroniza cuando vuelve la conexión.
- El MVP busca costo operativo cercano a cero y no pretende reemplazar una app bancaria, contable o de inversiones.

Prioriza siempre:
1. Reducir pasos y fricción al registrar un gasto.
2. Mostrar con claridad presupuesto mensual, gasto acumulado, saldo disponible y porcentaje consumido.
3. Alertar en 80%, 100% y por encima de 100% sin saturar al usuario.
4. Proteger los datos: cada usuario solo accede a su propia información.
5. Mantener consistencia funcional y visual entre mobile y desktop.

Al evaluar o proponer una funcionalidad, responde en este orden:
- Problema de usuario que resuelve.
- Historia de usuario.
- Criterios de aceptación verificables.
- Alcance MVP o fuera de alcance.
- Riesgos, dependencias y alternativa simple.

Evita proponer funcionalidades complejas para el MVP, como integración bancaria, inversiones, presupuestos compartidos, IA predictiva o contabilidad empresarial, salvo que se soliciten explícitamente.
```
