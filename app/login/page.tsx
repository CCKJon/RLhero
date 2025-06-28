'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { auth } from '@/lib/firebase'
import { useUserStore } from '@/store/userStore'

export default function Login() {
  const router = useRouter()
  const { actions: { login } } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check for saved credentials
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedPassword = localStorage.getItem('rememberedPassword')
    if (savedEmail && savedPassword) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        password: savedPassword,
        rememberMe: true
      }))
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('') // Clear any existing errors
    setIsLoading(true)
    
    try {
      await login(formData.email, formData.password)
      
      // Save credentials if remember me is checked
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email)
        localStorage.setItem('rememberedPassword', formData.password)
      } else {
        localStorage.removeItem('rememberedEmail')
        localStorage.removeItem('rememberedPassword')
      }
      
      // Wait for user data to be loaded before redirecting
      const { actions: { loadUserData } } = useUserStore.getState()
      await loadUserData()
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark flex items-center justify-center px-4 py-8 sm:py-12">
      <motion.div 
        className="w-full max-w-sm sm:max-w-md bg-white dark:bg-dark rounded-xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-display text-primary-600 dark:text-primary-400 mb-4 sm:mb-6 text-center">
            Resume Your Quest
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input w-full"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input w-full"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              
              <Link href="/forgot-password" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            
            <div className="mt-6">
              <button 
                type="submit" 
                className="btn btn-primary w-full py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 text-center border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need an account?{' '}
            <Link href="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Start Your Journey
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
} 