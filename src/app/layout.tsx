import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/store'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Paltazo - Control de Gastos',
  description: 'Detecta el paltazo antes de que te detecte a ti',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#42690e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
