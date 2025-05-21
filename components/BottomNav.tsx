'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-dark/90 backdrop-blur-lg fixed bottom-0 w-full border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around h-16">
          <Link 
            href="/dashboard" 
            className={`flex flex-col items-center justify-center w-full ${
              isActive('/dashboard') ? 'text-accent-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link 
            href="/quests" 
            className={`flex flex-col items-center justify-center w-full ${
              isActive('/quests') ? 'text-accent-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-xs">Quests</span>
          </Link>
          <Link 
            href="/party" 
            className={`flex flex-col items-center justify-center w-full ${
              isActive('/party') ? 'text-accent-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-xs">Party</span>
          </Link>
          <Link 
            href="/settings" 
            className={`flex flex-col items-center justify-center w-full ${
              isActive('/settings') ? 'text-accent-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  )
} 