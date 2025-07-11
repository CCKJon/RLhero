import './globals.css'
import type { Metadata } from 'next'
import ClientLayout from './components/ClientLayout'
import { EnvDebug } from '@/components/EnvDebug'

export const metadata: Metadata = {
  title: 'RL Hero - Level Up Your Life',
  description: 'Transform your daily tasks into a fantasy RPG adventure',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
        <EnvDebug />
      </body>
    </html>
  )
} 