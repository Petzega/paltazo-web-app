'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAppState } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAppState()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login()
    router.push('/dashboard')
  }

  const toggleMode = () => setMode(mode === 'login' ? 'register' : 'login')

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

      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
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
                className="w-full h-12 pl-11 pr-4 bg-surface-container rounded-xl text-body-md text-on-surface placeholder:text-text-secondary outline-none focus:bg-surface-container-high transition-colors"
                type="email"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-label-md text-on-surface-variant font-medium" htmlFor="input-password">
                Contraseña
              </label>
              {mode === 'login' && (
                <button type="button" className="text-label-sm text-secondary hover:underline">
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
                className="w-full h-12 pl-11 pr-4 bg-surface-container rounded-xl text-body-md text-on-surface placeholder:text-text-secondary outline-none focus:bg-surface-container-high transition-colors"
                type="password"
              />
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            className="h-12 mt-space-xs rounded-full bg-primary-container text-on-primary text-label-lg shadow-sm flex items-center justify-center gap-space-xs hover:opacity-95 active:scale-[0.99] transition-all"
          >
            {mode === 'login' ? 'Ingresar' : 'Crear cuenta'} →
          </Button>
        </form>

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
      </div>

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
