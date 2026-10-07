'use client'

import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen flex flex-col bg-surface">
      <div className="flex-1 flex flex-col justify-center px-gutter">
        <div className="mb-space-xl text-center">
          <h1 className="text-headline-xl-mobile text-primary mb-space-sm">
            Paltazo
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Inicia sesión para continuar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-space-md">
          <div>
            <label htmlFor="email" className="block text-label-md text-on-surface-variant mb-space-xs">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-lg text-on-surface focus:outline-none focus:border-primary"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-label-md text-on-surface-variant mb-space-xs">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-lg text-on-surface focus:outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-on-primary text-label-lg py-4 rounded-full mt-space-lg"
          >
            Ingresar
          </button>
        </form>

        <p className="text-body-sm text-on-surface-variant text-center mt-space-lg">
          ¿No tienes cuenta? <a href="#" className="text-primary font-semibold">Regístrate</a>
        </p>
      </div>
    </main>
  )
}
