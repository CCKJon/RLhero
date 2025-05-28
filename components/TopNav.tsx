'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUserStore } from '@/store/userStore'
import { signOutUser } from '@/lib/firebase'
import { useRouter, usePathname } from 'next/navigation'

export default function TopNav() {
  const { character, actions: { resetState } } = useUserStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOutUser()
    resetState()
    router.push('/login')
  }

  if (!character) return null

  return (
    <nav className="bg-dark/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-display text-white">
              RL Hero
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className={`text-sm ${
                pathname === '/dashboard' ? 'text-accent-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/quests" 
              className={`text-sm ${
                pathname === '/quests' ? 'text-accent-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Quests
            </Link>
            <Link 
              href="/party" 
              className={`text-sm ${
                pathname === '/party' ? 'text-accent-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Party
            </Link>
            <Link 
              href="/shop" 
              className={`text-sm ${
                pathname === '/shop' ? 'text-accent-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Shop
            </Link>
            <Link 
              href="/profile" 
              className={`text-sm ${
                pathname === '/profile' ? 'text-accent-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Profile
            </Link>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-white mr-4">
              Level {character.level} {character.race}
            </span>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center focus:outline-none"
                type="button"
              >
                <div className="relative w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {character.level}
                  </span>
                </div>
              </button>
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 border-2 border-yellow-400"
                  style={{ zIndex: 9999 }}
                >
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/stats"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Stats
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                      role="menuitem"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 