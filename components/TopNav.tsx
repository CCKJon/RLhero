'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUserStore } from '@/store/userStore'
import { signOutUser } from '@/lib/firebase'
import { useRouter, usePathname } from 'next/navigation'
import { FiMenu, FiX, FiUser, FiBarChart, FiLogOut } from 'react-icons/fi'

export default function TopNav() {
  const { character, actions: { resetState } } = useUserStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await signOutUser()
    resetState()
    router.push('/login')
  }

  if (!character) return null

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/quests', label: 'Quests' },
    { href: '/social', label: 'Social' },
    { href: '/shop', label: 'Shop' },
    { href: '/crafting', label: 'Crafting' },
    { href: '/events', label: 'Events', hasNotification: true },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <nav className="bg-dark/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-display text-white">
              RL Hero
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={`text-sm relative ${
                  pathname === item.href ? 'text-accent-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {item.label}
                {item.hasNotification && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center">
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
            >
              {isMobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div 
        ref={mobileMenuRef}
        className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
          {/* Character Info */}
          <div className="px-3 py-2 border-b border-gray-700 mb-2">
            <div className="flex items-center">
              <div className="relative w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center mr-3">
                <span className="text-sm font-bold text-white">
                  {character.level}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{character.name}</p>
                <p className="text-sm text-gray-400">Level {character.level} {character.race}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium relative ${
                pathname === item.href 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.label}
              {item.hasNotification && (
                <span className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Link>
          ))}

          {/* Mobile User Menu */}
          <div className="pt-4 border-t border-gray-700">
            <Link
              href="/stats"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FiBarChart className="inline mr-2" />
              Stats
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700"
            >
              <FiLogOut className="inline mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 