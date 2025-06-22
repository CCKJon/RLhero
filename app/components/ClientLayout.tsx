'use client'

import TopNav from '@/components/TopNav'
import MessagingWidget from '@/components/MessagingWidget'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <TopNav />
      {children}
      <MessagingWidget />
    </>
  )
} 