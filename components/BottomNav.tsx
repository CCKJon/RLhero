'use client'

import { useRouter } from 'next/navigation'
import { signOutUser } from '@/lib/firebase'
import { useUserStore } from '@/store/userStore'

export default function BottomNav() {
  const router = useRouter()
  const { actions: { resetState } } = useUserStore()

  const handleSignOut = async () => {
    await signOutUser()
    resetState()
    router.push('/login')
  }

  return (
    <nav className="bg-dark/90 backdrop-blur-lg fixed bottom-0 w-full border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center h-16">
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center w-full text-red-400 hover:text-red-300"
          >
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
} 