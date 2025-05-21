'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import TestConfig from './test-config'

export default function Home() {
  const router = useRouter()
  const { character } = useUserStore()
  
  // If user already has a character, redirect to dashboard
  useEffect(() => {
    if (character) {
      router.push('/dashboard')
    }
  }, [character, router])
  
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background */}
        <div className="absolute inset-0 bg-hero-pattern opacity-20 bg-repeat"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/30 to-dark/70"></div>
        
        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
          <motion.h1 
            className="text-5xl md:text-7xl font-display font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            RL Hero
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/90 mb-8 font-fantasy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Transform your daily tasks into a fantasy adventure
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link href="/register" className="btn btn-primary text-lg px-8 py-3">
              Begin Your Journey
            </Link>
            <Link href="/login" className="btn bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 text-lg px-8 py-3">
              Resume Quest
            </Link>
          </motion.div>
          
          <motion.div
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <div className="card bg-dark/70 backdrop-blur-sm p-6">
              <h3 className="text-xl font-fantasy text-accent-400 mb-2">Track Daily Quests</h3>
              <p className="text-white/80">Transform your daily tasks into rewarding adventures</p>
            </div>
            <div className="card bg-dark/70 backdrop-blur-sm p-6">
              <h3 className="text-xl font-fantasy text-accent-400 mb-2">Level Up Skills</h3>
              <p className="text-white/80">Improve your real-life abilities while gaining fantasy powers</p>
            </div>
            <div className="card bg-dark/70 backdrop-blur-sm p-6">
              <h3 className="text-xl font-fantasy text-accent-400 mb-2">Compete or Collaborate</h3>
              <p className="text-white/80">Join guilds, challenge others, or embark on a solo journey</p>
            </div>
          </motion.div>
        </div>
      </div>
      <TestConfig />
    </main>
  )
} 