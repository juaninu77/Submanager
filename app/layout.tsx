import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Submanager - Gestión de Suscripciones',
  description: 'Aplicación minimalista para gestionar tus suscripciones mensuales',
  generator: 'v0.dev',
  manifest: '/manifest.json',
  keywords: ['suscripciones', 'finanzas', 'gestión', 'presupuesto', 'PWA'],
  authors: [{ name: 'Submanager Team' }],
  creator: 'v0.dev',
  publisher: 'Submanager',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Submanager - Gestión de Suscripciones',
    description: 'Aplicación minimalista para gestionar tus suscripciones mensuales',
    siteName: 'Submanager',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Submanager - Gestión de Suscripciones',
    description: 'Aplicación minimalista para gestionar tus suscripciones mensuales',
  },
  appleWebApp: {
    capable: true,
    title: 'Submanager',
    statusBarStyle: 'default',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  )
}
