'use client'

import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <TopNav />
      {children}
      <BottomNav />
    </>
  )
} 