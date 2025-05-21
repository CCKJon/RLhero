'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useUserStore } from '@/store/userStore'

type GameEvent = {
  id: string
  type: 'quest' | 'battle' | 'treasure' | 'skill'
  title: string
  description: string
  reward: string
  difficulty: number
  image: string
}

const GAME_EVENTS: GameEvent[] = [
  {
    id: '1',
    type: 'quest',
    title: 'Study Session',
    description: 'Complete a focused study session to gain knowledge and experience.',
    reward: '+50 XP, +2 Intelligence',
    difficulty: 1,
    image: '/images/fire-emblem/quest-study.png'
  },
  {
    id: '2',
    type: 'battle',
    title: 'Workout Challenge',
    description: 'Defeat the laziness monster with a 30-minute workout!',
    reward: '+75 XP, +3 Strength',
    difficulty: 2,
    image: '/images/fire-emblem/battle-workout.png'
  },
  {
    id: '3',
    type: 'treasure',
    title: 'Hidden Knowledge',
    description: 'Discover a new skill or hobby to unlock special abilities.',
    reward: 'New Skill Unlocked',
    difficulty: 1,
    image: '/images/fire-emblem/treasure-knowledge.png'
  },
  {
    id: '4',
    type: 'skill',
    title: 'Social Interaction',
    description: 'Practice your social skills in a group setting.',
    reward: '+40 XP, +2 Charisma',
    difficulty: 2,
    image: '/images/fire-emblem/skill-social.png'
  }
]

export default function Game() {
  const { character, actions: { gainExperience } } = useUserStore()
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null)
  const [showReward, setShowReward] = useState(false)

  const handleEventComplete = (event: GameEvent) => {
    // Calculate XP based on difficulty
    const xpGain = event.difficulty * 25
    gainExperience(xpGain)
    setShowReward(true)
    
    // Hide reward after 3 seconds
    setTimeout(() => {
      setShowReward(false)
      setSelectedEvent(null)
    }, 3000)
  }

  if (!character) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark">
      {/* Top Navigation */}
      <nav className="bg-dark/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-display text-white">
                RL Hero
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <span className="text-primary-400 font-bold">{character.experience}</span> XP
              </div>
              <div className="text-white">
                Level <span className="text-accent-400 font-bold">{character.level}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-white">Adventure Map</h1>
          <p className="text-gray-400">Choose your next challenge</p>
        </div>

        {/* Game Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GAME_EVENTS.map((event) => (
            <motion.div
              key={event.id}
              className="bg-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedEvent(event)}
            >
              <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={event.image}
                  alt={event.title}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-primary-900/60 text-primary-300 py-1 px-2 rounded">
                    {event.difficulty} ⭐
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-display text-white mb-2">{event.title}</h3>
              <p className="text-gray-400 mb-4">{event.description}</p>
              <div className="text-sm text-accent-400">{event.reward}</div>
            </motion.div>
          ))}
        </div>

        {/* Event Modal */}
        {selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-dark/90 rounded-xl p-8 max-w-lg w-full border border-gray-800"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                <Image
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  width={500}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-display text-white mb-4">{selectedEvent.title}</h2>
              <p className="text-gray-300 mb-6">{selectedEvent.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-accent-400">{selectedEvent.reward}</div>
                <button
                  onClick={() => handleEventComplete(selectedEvent)}
                  className="btn btn-primary"
                >
                  Accept Challenge
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Reward Animation */}
        {showReward && selectedEvent && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <div className="bg-accent-500/20 backdrop-blur-sm rounded-xl p-8 border border-accent-500/50">
              <h3 className="text-2xl font-display text-accent-400 mb-2">Challenge Completed!</h3>
              <p className="text-white">{selectedEvent.reward}</p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
} 