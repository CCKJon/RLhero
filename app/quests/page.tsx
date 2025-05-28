'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useUserStore } from '@/store/userStore'
import type { QuestCategory } from '@/store/userStore'

export default function Quests() {
  const { quests, actions: { addQuest } } = useUserStore()
  const [selectedTab, setSelectedTab] = useState<'daily' | 'available'>('daily')
  const [questFilter, setQuestFilter] = useState<'All' | QuestCategory>('All')
  const [newQuest, setNewQuest] = useState({ 
    name: '', 
    reward: 30, 
    category: 'Wellness' as QuestCategory 
  })

  const filteredQuests = quests.filter(
    quest => questFilter === 'All' || quest.category === questFilter
  )

  const handleAddQuest = (e: React.FormEvent) => {
    e.preventDefault()
    addQuest({
      name: newQuest.name,
      reward: newQuest.reward,
      completed: false,
      category: newQuest.category
    })
    setNewQuest({ name: '', reward: 30, category: 'Wellness' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-dark">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-white">Quests</h1>
          <p className="text-gray-400">Complete quests to gain experience and rewards</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'daily' 
                ? 'text-accent-400 border-b-2 border-accent-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setSelectedTab('daily')}
          >
            Daily Quests
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'available' 
                ? 'text-accent-400 border-b-2 border-accent-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setSelectedTab('available')}
          >
            Available Quests
          </button>
        </div>

        {/* Quest Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', 'Wellness', 'Education', 'Fitness', 'Health', 'Skills'].map((category) => (
            <button
              key={category}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                questFilter === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setQuestFilter(category as any)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTab === 'daily' && (
            <div className="space-y-4">
              {filteredQuests.map((quest) => (
                <div 
                  key={quest.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={quest.completed}
                        onChange={() => {}}
                        className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-700"
                      />
                      <div className="ml-3">
                        <h3 className="text-white font-medium">{quest.name}</h3>
                        <p className="text-sm text-gray-400">{quest.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs bg-accent-900/50 text-accent-300 px-2 py-1 rounded">
                        +{quest.reward} XP
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Quest Form */}
              <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-sm font-medium text-white mb-3">Add Custom Quest</h3>
                <form onSubmit={handleAddQuest} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newQuest.name}
                    onChange={(e) => setNewQuest({ ...newQuest, name: e.target.value })}
                    placeholder="Enter quest name..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <select
                    value={newQuest.category}
                    onChange={(e) => setNewQuest({ ...newQuest, category: e.target.value as QuestCategory })}
                    className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Wellness">Wellness</option>
                    <option value="Education">Education</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Health">Health</option>
                    <option value="Skills">Skills</option>
                  </select>
                  <button
                    type="submit"
                    className="btn btn-primary text-sm"
                  >
                    Add Quest
                  </button>
                </form>
              </div>
            </div>
          )}

          {selectedTab === 'available' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Defeat the Dragon', 'Rescue the Princess', 'Find the Sacred Stone', 'Train with the Mercenaries'].map((quest, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-primary-900 rounded-md flex-shrink-0 flex items-center justify-center mr-3">
                      <Image 
                        src={`/images/fire-emblem/quest-${index + 1}.png`}
                        alt="Quest"
                        width={32}
                        height={32}
                      />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-medium">{quest}</h4>
                      <p className="text-gray-400 text-xs mt-1">Difficulty: {index + 1} ⭐</p>
                      <div className="mt-2 flex items-center">
                        <span className="text-xs bg-primary-900/50 text-primary-300 px-2 py-1 rounded mr-2">
                          +{(index + 1) * 50} XP
                        </span>
                        <span className="text-xs bg-accent-900/50 text-accent-300 px-2 py-1 rounded">
                          Reward: {(index + 1) * 100} Gold
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
} 