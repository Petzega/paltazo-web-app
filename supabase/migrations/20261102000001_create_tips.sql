-- ============================================
-- PALTAZO - Crear tabla tips
-- ============================================
-- Consejos rotativos de finanzas personales.
-- Lectura pública (sin auth). Edición solo admin vía RLS deshabilitada por ahora.

CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tips are readable by everyone"
  ON tips FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE bloqueados por defecto (sin política = sin acceso).
-- Habilitar cuando exista un panel admin.

CREATE INDEX IF NOT EXISTS idx_tips_active_order ON tips(is_active, sort_order);

-- ============================================
-- Seed: 30 consejos de finanzas personales
-- ============================================
INSERT INTO tips (content, is_active, sort_order) VALUES
  ('Anotar gastos al momento reduce el gasto impulsivo en un 22%.', true, 1),
  ('Antes de comprar algo caro, espera 48 horas. Si sigues queriéndolo, cómpralo.', true, 2),
  ('Revisa tus suscripciones cada mes: Netflix, Spotify, apps. Cancela lo que no uses.', true, 3),
  ('Págate primero: ahorra antes de gastar, no lo que sobre al final del mes.', true, 4),
  ('Divide tu ingreso: 50% necesidades, 30% gustos, 20% ahorro.', true, 5),
  ('Un gasto de S/10 diario es S/300 al mes. Identifica tus "gastos hormiga".', true, 6),
  ('Define un fondo de emergencia de 3 meses de gastos fijos antes de invertir.', true, 7),
  ('Si no puedes pagarlo tres veces, no puedes pagarlo ni una vez.', true, 8),
  ('Usa efectivo para compras discrecionales: duele más que pasar la tarjeta.', true, 9),
  ('Automatiza tu ahorro: transfiere el mismo monto cada mes al mismo día.', true, 10),
  ('Compara precios antes de compras grandes. Una hora de búsqueda ahorra hasta 20%.', true, 11),
  ('Revisa tu estado de cuenta bancario una vez por semana, no una vez por mes.', true, 12),
  ('Cocinar en casa vs pedir delivery puede ahorrarte S/400 al mes.', true, 13),
  ('No confundas "oferta" con "necesidad". Comprar algo barato que no necesitas es gastar.', true, 14),
  ('Define metas financieras con fecha: "S/2000 para diciembre" funciona mejor que "ahorrar más".', true, 15),
  ('Si tu ingreso sube, mantén tu estilo de vida y ahorra la diferencia.', true, 16),
  ('Lleva un registro de 30 días de todos tus gastos antes de hacer un presupuesto.', true, 17),
  ('Pagar el mínimo de la tarjeta es la deuda más cara que puedes tener.', true, 18),
  ('Revisa tu historial crediticio una vez al año: es gratis y detecta errores.', true, 19),
  ('Antes de un préstamo, calcula el costo total con intereses, no solo la cuota.', true, 20),
  ('Separa tu dinero en "sobres" digitales: una cuenta para gastos fijos, otra para ahorro.', true, 21),
  ('No tomes decisiones financieras grandes cuando estés emocionalmente alterado.', true, 22),
  ('Invierte en tu salud: un chequeo preventivo ahorra miles en tratamientos futuros.', true, 23),
  ('Si algo es gratis y no sabes por qué, el producto eres tú (datos, atención, hábitos).', true, 24),
  ('Aprende a decir "no" a planes sociales que no se alineen con tus metas.', true, 25),
  ('Revisa tus seguros una vez al año: podrías estar pagando de más o tener huecos.', true, 26),
  ('El mejor momento para ahorrar fue ayer. El segundo mejor momento es hoy.', true, 27),
  ('No compares tu situación financiera con la de otros en redes sociales.', true, 28),
  ('Antes de renovar un contrato (alquiler, seguro, internet), negocia. Siempre se puede bajar.', true, 29),
  ('Tu red de apoyo financiera más fuerte es tu disciplina, no tu ingreso.', true, 30)
ON CONFLICT DO NOTHING;
