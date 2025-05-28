'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useUserStore } from '@/store/userStore'
import { ALL_EQUIPMENT } from '@/types/equipment';

// Define available skills and their unlock levels
const AVAILABLE_SKILLS = [
  {
    name: 'Sword Mastery',
    description: 'Increases damage with swords by 10% per level',
    unlockLevel: 1,
    category: 'Combat'
  },
  {
    name: 'Archery',
    description: 'Increases accuracy and damage with bows by 15% per level',
    unlockLevel: 5,
    category: 'Combat'
  },
  {
    name: 'Magic Affinity',
    description: 'Increases spell damage and reduces mana cost by 12% per level',
    unlockLevel: 10,
    category: 'Magic'
  },
  {
    name: 'Stealth',
    description: 'Increases chance to avoid detection and critical hit chance by 8% per level',
    unlockLevel: 15,
    category: 'Utility'
  },
  {
    name: 'Leadership',
    description: 'Increases party member stats by 5% per level',
    unlockLevel: 20,
    category: 'Social'
  },
  {
    name: 'Alchemy',
    description: 'Increases potion effectiveness and crafting success rate by 15% per level',
    unlockLevel: 25,
    category: 'Crafting'
  }
]

export default function Stats() {
  const { character } = useUserStore()
  const [selectedTab, setSelectedTab] = useState<'stats' | 'skills' | 'locked'>('stats')

  if (!character) return null

  // Hydrate equipment with full item data
  const hydratedEquipment = Object.fromEntries(
    Object.entries(character?.equipment || {}).map(([slot, item]) => [
      slot,
      item && typeof item === 'object' && item.id ? item : ALL_EQUIPMENT.find(e => e.id === (item?.id || item)) || null
    ])
  );

  const unlockedSkills = character.skills
  const lockedSkills = AVAILABLE_SKILLS.filter(
    skill => !unlockedSkills.find(s => s.name === skill.name) && skill.unlockLevel > character.level
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-dark">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-white">Character Stats</h1>
          <p className="text-gray-400">View and manage your character's abilities</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'stats' 
                ? 'text-accent-400 border-b-2 border-accent-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setSelectedTab('stats')}
          >
            Stats
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'skills' 
                ? 'text-accent-400 border-b-2 border-accent-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setSelectedTab('skills')}
          >
            Skills
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'locked' 
                ? 'text-accent-400 border-b-2 border-accent-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setSelectedTab('locked')}
          >
            Locked Skills
          </button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTab === 'stats' && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Stats */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Character Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(character.stats).map(([stat, value]) => (
                    <div key={stat} className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400 capitalize">{stat}</span>
                        <span className="text-sm font-medium text-white">{value}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent-500" 
                          style={{ width: `${(Number(value) / 20) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Image 
                    src="/images/fire-emblem/stats-radar.png" 
                    alt="Character stats visualization" 
                    width={250} 
                    height={200} 
                    className="opacity-90"
                  />
                </div>
              </div>

              {/* Equipment */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Equipment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(hydratedEquipment).map(([slot, item]) => (
                    <div key={slot} className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 capitalize mb-2">{slot}</label>
                      {item ? (
                        <>
                          <div className="w-full h-16 mb-3 flex items-center justify-center">
                            <Image 
                              src={item.image} 
                              alt={item.name} 
                              width={48} 
                              height={48} 
                              className="opacity-90"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-white font-medium">{item.name}</p>
                              <span className="text-xs text-gray-400">Level {item.level}</span>
                            </div>
                            <p className="text-sm text-gray-400">{item.description}</p>
                            {item.stats && Object.entries(item.stats).length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs text-gray-400 font-medium">Stats:</p>
                                {Object.entries(item.stats).map(([stat, value]) => (
                                  <div key={stat} className="flex justify-between text-xs">
                                    <span className="text-gray-400 capitalize">{stat}</span>
                                    <span className="text-primary-400">+{value}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {item.set && (
                              <div className="mt-2 p-2 bg-gray-700/30 rounded">
                                <p className="text-xs text-gray-300 mb-1">Part of {item.set}</p>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-400">No {slot} equipped</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'skills' && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {unlockedSkills.map((skill) => (
                <div key={skill.name} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white">{skill.name}</h3>
                      <p className="text-sm text-gray-400">
                        {AVAILABLE_SKILLS.find(s => s.name === skill.name)?.description}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-accent-400">Level {skill.level}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500" 
                      style={{ width: `${skill.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Progress: {skill.progress}%</p>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'locked' && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {lockedSkills.map((skill) => (
                <div key={skill.name} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white">{skill.name}</h3>
                      <p className="text-sm text-gray-400">{skill.description}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Unlocks at Level {skill.unlockLevel}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                      <span>Current Level</span>
                      <span>{character.level}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-600" 
                        style={{ width: `${(character.level / skill.unlockLevel) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {skill.unlockLevel - character.level} levels remaining
                    </p>
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