'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { signIn, signUp, resetPassword } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'register' | 'reset' | 'new-password'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    if (hash.get('type') === 'recovery') {
      setMode('new-password')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error: authError } = await signIn(email, password)
        if (authError) throw authError
      } else if (mode === 'register') {
        const { error: authError } = await signUp(email, password, name)
        if (authError) throw authError
      } else {
        const { error: authError } = await resetPassword(email)
        if (authError) throw authError
        setSuccess('Revisa tu correo para restablecer la contraseña')
      }
      if (mode !== 'reset' && mode !== 'new-password') router.push('/')
    } catch (err: any) {
      setError(err.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setSuccess('Contraseña actualizada. Inicia sesión.')
      setMode('login')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Error al actualizar contraseña')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
  }

  return (
    <main className="min-h-screen flex flex-col bg-surface max-w-xl mx-auto px-gutter">
      <div className="flex flex-col items-center text-center mt-space-md mb-space-lg">
        <div className="relative w-16 h-16 flex items-center justify-center bg-surface-container-low rounded-full shadow-sm mb-space-sm">
          <span className="text-3xl">🥑</span>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
            🔒
          </div>
        </div>
        <h1 className="text-headline-lg-mobile text-on-surface font-bold tracking-tight">
          Bienvenido a Paltazo
        </h1>
        <p className="text-body-md text-text-secondary mt-space-xs max-w-xs">
          Tu presupuesto bajo control en todo momento
        </p>
      </div>

      {mode !== 'reset' && mode !== 'new-password' && (
      <div className="bg-surface-container-low p-1.5 rounded-full flex items-center justify-between mb-space-lg shadow-sm">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-2 rounded-full text-label-lg text-center transition-all duration-200 ${
            mode === 'login'
              ? 'bg-secondary text-on-secondary shadow-sm'
              : 'text-text-secondary hover:text-on-surface'
          }`}
        >
          Ingresar
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 py-2 rounded-full text-label-lg text-center transition-all duration-200 ${
            mode === 'register'
              ? 'bg-secondary text-on-secondary shadow-sm'
              : 'text-text-secondary hover:text-on-surface'
          }`}
        >
          Registrarse
        </button>
      </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
        {error && (
          <div className="p-space-sm rounded-xl bg-danger/10 text-danger text-label-md">
            {error}
          </div>
        )}
        {success && (
          <div className="p-space-sm rounded-xl bg-primary/10 text-primary text-label-md">
            {success}
          </div>
        )}
        <form onSubmit={mode === 'new-password' ? handleNewPassword : handleSubmit} className="flex flex-col gap-space-md">
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md text-on-surface-variant font-medium" htmlFor="input-name">
                Nombre completo
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-text-secondary text-[20px] pointer-events-none">
                  👤
                </span>
                <input
                  id="input-name"
                  placeholder="Ej. Lucas Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-surface-container rounded-xl text-body-md text-on-surface placeholder:text-text-secondary outline-none focus:bg-surface-container-high transition-colors"
                  type="text"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-label-md text-on-surface-variant font-medium" htmlFor="input-email">
              Correo electrónico
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-text-secondary text-[20px] pointer-events-none">
                ✉️
              </span>
              <input
                id="input-email"
                placeholder="ejemplo@correo.pe"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-surface-container rounded-xl text-body-md text-on-surface placeholder:text-text-secondary outline-none focus:bg-surface-container-high transition-colors"
                type="email"
              />
            </div>
          </div>

        {mode === 'new-password' && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md text-on-surface-variant font-medium" htmlFor="input-new-password">
                Nueva contraseña
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-text-secondary text-[20px] pointer-events-none">
                  🔑
                </span>
                <input
                  id="input-new-password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-surface-container rounded-xl text-body-md text-on-surface placeholder:text-text-secondary outline-none focus:bg-surface-container-high transition-colors"
                  type="password"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md text-on-surface-variant font-medium" htmlFor="input-confirm-password">
                Confirmar contraseña
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-text-secondary text-[20px] pointer-events-none">
                  🔑
                </span>
                <input
                  id="input-confirm-password"
                  placeholder="Repite la contraseña"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-surface-container rounded-xl text-body-md text-on-surface placeholder:text-text-secondary outline-none focus:bg-surface-container-high transition-colors"
                  type="password"
                />
              </div>
            </div>
          </>
        )}
        {mode !== 'reset' && mode !== 'new-password' && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-label-md text-on-surface-variant font-medium" htmlFor="input-password">
                Contraseña
              </label>
              {mode === 'login' && (
                <button type="button" onClick={() => { setMode('reset'); setError('') }} className="text-label-sm text-secondary hover:underline">
                  ¿Olvidaste tu clave?
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-text-secondary text-[20px] pointer-events-none">
                🔑
              </span>
              <input
                id="input-password"
                placeholder="Mínimo 6 caracteres"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-surface-container rounded-xl text-body-md text-on-surface placeholder:text-text-secondary outline-none focus:bg-surface-container-high transition-colors"
                type="password"
              />
            </div>
          </div>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            className="h-12 mt-space-xs rounded-full bg-primary-container text-on-primary text-label-lg shadow-sm flex items-center justify-center gap-space-xs hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? '⏳' : (mode === 'login' ? 'Ingresar' : mode === 'register' ? 'Crear cuenta' : mode === 'reset' ? 'Enviar enlace' : 'Actualizar contraseña')} →
          </Button>
          {(mode === 'reset' || mode === 'new-password') && (
            <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess('') }} className="text-body-md text-text-secondary hover:text-on-surface transition-colors text-center">
              ← Volver al inicio de sesión
            </button>
          )}
        </form>

        {mode !== 'reset' && mode !== 'new-password' && (
        <>
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-surface-variant" />
          <span className="text-label-sm text-text-secondary uppercase tracking-wider">o</span>
          <div className="flex-1 h-px bg-surface-variant" />
        </div>

        <button
          type="button"
          className="w-full h-12 rounded-full bg-surface-container text-on-surface text-label-lg flex items-center justify-center gap-space-sm hover:bg-surface-container-high transition-colors active:scale-[0.99]"
        >
          <span className="text-lg">🔐</span>
          Continuar con Google
        </button>
        </>
        )}
      </div>

      {mode !== 'reset' && mode !== 'new-password' && (
      <div className="mt-space-md text-center">
        <button
          onClick={toggleMode}
          className="text-body-md text-text-secondary hover:text-on-surface transition-colors"
        >
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta? <span className="text-label-lg text-secondary font-semibold ml-1">Regístrate</span>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta? <span className="text-label-lg text-secondary font-semibold ml-1">Inicia sesión</span>
            </>
          )}
        </button>
      </div>
      )}

      <div className="mt-space-lg mb-space-sm bg-secondary-container/30 rounded-xl p-space-md flex items-center gap-space-sm">
        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0 text-on-secondary-container">
          ✅
        </div>
        <p className="text-body-sm text-on-surface-variant">
          Tus datos se guardan de forma segura y funcionan sin conexión (offline).
        </p>
      </div>
    </main>
  )
}
