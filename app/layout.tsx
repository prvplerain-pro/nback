import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import AuthSessionCleanup from './AuthSessionCleanup'
import './globals.css'

export const metadata: Metadata = {
  title: 'lock-iN | Dual N-Back',
  description: 'Trénink pracovní paměti.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body style={{ fontFamily: 'var(--font-geist-sans)' }}>
        <AuthSessionCleanup />
        {children}
      </body>
    </html>
  )
}
