# Corrección de Wireframes Web — Paltazo

Los wireframes web generados no mantienen el mismo estilo que los wireframes mobile. Corrige el diseño siguiendo estas reglas:

1. Revisa los wireframes mobile existentes dentro de este mismo proyecto.
2. Copia exactamente los mismos tokens visuales:
   - Primario: `#8FBC5A`
   - Secundario: `#4A7C2C`
   - Fondo: `#FFFFFF`
   - Texto: `#1A1A1A`
   - Tipografía: Inter o sans-serif equivalente
   - Espaciado: 8, 16, 24 y 32 px
3. Mantén idénticos los estilos de botones, cards, inputs, selectores, barras de progreso e íconos.
4. Regenera solo el layout desktop a `1440x900 px`:
   - Sidebar izquierda: Dashboard, Gastos y Configuración.
   - Dashboard central con card de presupuesto, barra de progreso y tabla de gastos.
   - Tabla: Fecha, Categoría, Descripción, Monto y Acciones.
   - Agregar gasto mediante panel lateral derecho, no modal.
5. La alerta debe ser un banner contextual dentro del dashboard, no una pantalla independiente.
6. No agregues colores, tipografías, sombras, bordes ni componentes nuevos que no existan en mobile.
7. Verifica visualmente que el resultado sea la misma identidad de Paltazo adaptada a desktop, no un diseño diferente.
