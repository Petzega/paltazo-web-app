// Consejos rotativos cargados desde Supabase.
// Se barajan al azar y se consumen sin repetir hasta agotar los 30.
import { getLocalDate } from '@/lib/expenseConstants'
import supabase from '@/lib/supabase/client'

export interface Tip {
  id: string
  content: string
  is_active: boolean
  sort_order: number
}

// Cache en módulo (client-side, no persiste entre reloads pero sí entre llamadas)
let cachedTips: string[] | null = null
let loadPromise: Promise<string[]> | null = null

export function loadTips(): Promise<string[]> {
  if (cachedTips) return Promise.resolve(cachedTips)
  if (loadPromise) return loadPromise
  loadPromise = Promise.resolve(supabase
    .from('tips')
    .select('content')
    .eq('is_active', true)
    .order('sort_order', { ascending: true }))
    .then(({ data, error }) => {
      if (error) {
        console.warn('[tips] fallback a lista hardcoded:', error.message)
        cachedTips = TIPS
        return TIPS
      }
      cachedTips = (data ?? []).map((t) => t.content)
      return cachedTips
    })
  return loadPromise
}

export function getTipOfDay(tips: string[]): string {
  if (tips.length === 0) return ''
  const today = getLocalDate()
  const KEY = 'paltazo:tips-v1'
  const state = readState(KEY)

  if (!state || state.lastDate !== today) {
    const next = !state ? { order: shuffle(tips.length), idx: 0, lastDate: today }
      : (() => {
          const newDate = today
          let idx = state.idx + 1
          let order = state.order
          if (idx >= order.length) {
            order = shuffle(tips.length)
            idx = 0
          }
          return { order, idx, lastDate: newDate }
        })()
    writeState(KEY, next)
    return tips[next.order[next.idx]]
  }

  return tips[state.order[state.idx]]
}

interface TipState { order: number[]; idx: number; lastDate: string }

function readState(key: string): TipState | null {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}

function writeState(key: string, s: TipState) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(s)) } catch {}
}

function shuffle(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]; a[i] = a[j]; a[j] = t
  }
  return a
}

// Fallback si Supabase no responde (SSR o error de red)
export const TIPS = [
  'Anotar gastos al momento reduce el gasto impulsivo en un 22%.',
  'Antes de comprar algo caro, espera 48 horas. Si sigues queriéndolo, cómpralo.',
  'Revisa tus suscripciones cada mes: Netflix, Spotify, apps. Cancela lo que no uses.',
  'Págate primero: ahorra antes de gastar, no lo que sobre al final del mes.',
  'Divide tu ingreso: 50% necesidades, 30% gustos, 20% ahorro.',
  'Un gasto de S/10 diario es S/300 al mes. Identifica tus "gastos hormiga".',
  'Define un fondo de emergencia de 3 meses de gastos fijos antes de invertir.',
  'Si no puedes pagarlo tres veces, no puedes pagarlo ni una vez.',
  'Usa efectivo para compras discrecionales: duele más que pasar la tarjeta.',
  'Automatiza tu ahorro: transfiere el mismo monto cada mes al mismo día.',
  'Compara precios antes de compras grandes. Una hora de búsqueda ahorra hasta 20%.',
  'Revisa tu estado de cuenta bancario una vez por semana, no una vez por mes.',
  'Cocinar en casa vs pedir delivery puede ahorrarte S/400 al mes.',
  'No confundas "oferta" con "necesidad". Comprar algo barato que no necesitas es gastar.',
  'Define metas financieras con fecha: "S/2000 para diciembre" funciona mejor que "ahorrar más".',
  'Si tu ingreso sube, mantén tu estilo de vida y ahorra la diferencia.',
  'Lleva un registro de 30 días de todos tus gastos antes de hacer un presupuesto.',
  'Pagar el mínimo de la tarjeta es la deuda más cara que puedes tener.',
  'Revisa tu historial crediticio una vez al año: es gratis y detecta errores.',
  'Antes de un préstamo, calcula el costo total con intereses, no solo la cuota.',
  'Separa tu dinero en "sobres" digitales: una cuenta para gastos fijos, otra para ahorro.',
  'No tomes decisiones financieras grandes cuando estés emocionalmente alterado.',
  'Invierte en tu salud: un chequeo preventivo ahorra miles en tratamientos futuros.',
  'Si algo es gratis y no sabes por qué, el producto eres tú (datos, atención, hábitos).',
  'Aprende a decir "no" a planes sociales que no se alineen con tus metas.',
  'Revisa tus seguros una vez al año: podrías estar pagando de más o tener huecos.',
  'El mejor momento para ahorrar fue ayer. El segundo mejor momento es hoy.',
  'No compares tu situación financiera con la de otros en redes sociales.',
  'Antes de renovar un contrato (alquiler, seguro, internet), negocia. Siempre se puede bajar.',
  'Tu red de apoyo financiera más fuerte es tu disciplina, no tu ingreso.',
]
