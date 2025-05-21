import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RL Hero - Level Up Your Life',
  description: 'Transform your daily tasks into a fantasy RPG adventure',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
} 