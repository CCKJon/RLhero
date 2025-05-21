'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useUserStore } from '@/store/userStore'
import { redirect } from 'next/navigation'
import type { QuestCategory } from '@/store/userStore'

export default function Dashboard() {
  const { 
    character, 
    quests, 
    actions: { 
      toggleQuestComplete, 
      addQuest,
      gainExperience 
    } 
  } = useUserStore()
  
  const [selectedTab, setSelectedTab] = useState<'quests' | 'stats' | 'inventory'>('quests')
  const [questFilter, setQuestFilter] = useState<'All' | QuestCategory>('All')
  const [newQuest, setNewQuest] = useState({ 
    name: '', 
    reward: 30, 
    category: 'Wellness' as QuestCategory 
  })
  
  // If no character, redirect to registration
  useEffect(() => {
    if (!character) {
      redirect('/register')
    }
  }, [character])
  
  if (!character) return null // Prevent rendering during redirect
  
  const completionPercentage = Math.round((character.experience / character.nextLevelXp) * 100)
  
  const filteredQuests = quests.filter(
    quest => questFilter === 'All' || quest.category === questFilter
  )
  
  const handleQuestToggle = (id: string) => {
    toggleQuestComplete(id)
  }
  
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
      {/* Top Navigation */}
      <nav className="bg-dark/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-display text-white">RL Hero</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-white mr-4">
                Level {character.level} {character.race}
              </span>
              <div className="relative w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {character.level}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Banner */}
      <div className="relative w-full h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-accent-900/80 z-10"></div>
        <Image 
          src="/images/fire-emblem/banner-bg.jpg" 
          alt="Game Banner"
          width={1920}
          height={400}
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 z-20 flex items-center px-8">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white drop-shadow-lg">
              Welcome back, <span className="text-accent-400">{character.name}</span>
            </h1>
            <div className="hidden md:block">
              <div className="px-4 py-2 bg-dark/50 backdrop-blur-sm rounded-lg border border-gray-700">
                <p className="text-sm font-medium text-gray-300">Daily Quests Completed</p>
                <p className="text-2xl font-bold text-white">
                  {quests.filter(q => q.completed).length}/{quests.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Character Summary */}
        <div className="mb-8">
          <motion.div 
            className="bg-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Character Portrait */}
              <div className="relative w-32 h-32 overflow-hidden rounded-lg border-2 border-accent-500 flex-shrink-0">
                <Image 
                  src={`/images/fire-emblem/character-${character.race}.png`}
                  alt={character.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-display font-bold text-white">
                  {character.name}
                </h1>
                <p className="text-sm text-gray-400">
                  Level {character.level} {character.race} • {character.titles[0] || 'Adventurer'}
                </p>
                
                {/* XP Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Experience: {character.experience}/{character.nextLevelXp}</span>
                    <span>{completionPercentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-500" 
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 md:w-auto w-full">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-primary-400">
                    {Object.values(character.stats).reduce((sum, stat) => sum + stat, 0)}
                  </div>
                  <div className="text-xs text-gray-400">Total Stats</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-accent-400">
                    {character.skills.length}
                  </div>
                  <div className="text-xs text-gray-400">Skills</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-secondary-400">
                    {character.titles.length || 1}
                  </div>
                  <div className="text-xs text-gray-400">Titles</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'quests' 
                ? 'text-accent-400 border-b-2 border-accent-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setSelectedTab('quests')}
          >
            Daily Quests
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'stats' 
                ? 'text-accent-400 border-b-2 border-accent-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setSelectedTab('stats')}
          >
            Character Stats
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'inventory' 
                ? 'text-accent-400 border-b-2 border-accent-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setSelectedTab('inventory')}
          >
            Inventory
          </button>
        </div>
        
        {/* Tab Content */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTab === 'quests' && (
            <div>
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
              
              {/* Quests List */}
              <div className="space-y-3">
                {filteredQuests.length === 0 ? (
                  <div className="text-center p-8">
                    <div className="mb-4">
                      <Image 
                        src="/images/fire-emblem/empty-quest.png" 
                        alt="No quests" 
                        width={120} 
                        height={120} 
                        className="mx-auto opacity-70"
                      />
                    </div>
                    <p className="text-gray-400">No quests available in this category.</p>
                    <p className="text-sm text-gray-500 mt-1">Add a new quest below to get started!</p>
                  </div>
                ) : (
                  filteredQuests.map((quest) => (
                    <div 
                      key={quest.id}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={quest.completed}
                          onChange={() => handleQuestToggle(quest.id)}
                          className="h-5 w-5 rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${quest.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                            {quest.name}
                          </p>
                          <span className="text-xs text-gray-500">{quest.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs bg-accent-900/50 text-accent-300 px-2 py-1 rounded">
                          +{quest.reward} XP
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
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
                  <input
                    type="number"
                    value={newQuest.reward}
                    onChange={(e) => setNewQuest({ ...newQuest, reward: parseInt(e.target.value) })}
                    min={5}
                    max={100}
                    className="w-full sm:w-20 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-primary-600 hover:bg-primary-500 text-white rounded-md px-4 py-2 text-sm font-medium"
                  >
                    Add Quest
                  </button>
                </form>
              </div>
            </div>
          )}
          
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
              
              {/* Skills */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Skills</h3>
                <div className="space-y-4">
                  {character.skills.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No skills learned yet.</p>
                      <p className="text-sm text-gray-500 mt-1">Complete quests to level up your skills!</p>
                    </div>
                  ) : (
                    character.skills.map((skill) => (
                      <div key={skill.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{skill.name}</span>
                          <span className="text-gray-400">Level {skill.level}</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500" 
                            style={{ width: `${skill.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Equipment */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Equipment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(character.equipment).map(([slot, item]) => (
                    <div key={slot} className="bg-gray-700/50 rounded-lg p-4 relative">
                      <div className="w-full h-16 mb-2 flex items-center justify-center">
                        <Image 
                          src={`/images/fire-emblem/item-${slot}.png`} 
                          alt={item as string} 
                          width={48} 
                          height={48} 
                          className="opacity-90"
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-center capitalize">{slot}</p>
                      <p className="text-sm text-white text-center mt-1">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Titles */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Titles</h3>
                <div className="grid grid-cols-1 gap-3">
                  {character.titles.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No titles earned yet.</p>
                      <p className="text-sm text-gray-500 mt-1">Complete quests to earn titles!</p>
                    </div>
                  ) : (
                    character.titles.map((title, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-700/50 rounded-lg p-3 flex items-center"
                      >
                        <div className="w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-300 text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-white">{title}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          {selectedTab === 'inventory' && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Available Quests</h3>
                
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
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-4">Battle Arena</h3>
                  <div className="bg-gray-700/50 rounded-lg p-4 border border-primary-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Image 
                          src="/images/fire-emblem/arena.png"
                          alt="Arena"
                          width={64}
                          height={64}
                          className="mr-4"
                        />
                        <div>
                          <h4 className="text-white font-medium">Weekly Tournament</h4>
                          <p className="text-gray-400 text-sm mt-1">Challenge other players and earn special rewards!</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded">
                        Enter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Character Shop</h3>
                
                <div className="space-y-4">
                  {['Magic Tome', 'Steel Sword', 'Healing Staff', 'Light Armor'].map((item, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-accent-900/50 rounded-md flex items-center justify-center mr-3">
                          <Image 
                            src={`/images/fire-emblem/shop-${index + 1}.png`}
                            alt={item}
                            width={24}
                            height={24}
                          />
                        </div>
                        <div>
                          <p className="text-white text-sm">{item}</p>
                          <p className="text-xs text-gray-400">+{index + 2} to stats</p>
                        </div>
                      </div>
                      <button className="px-2 py-1 bg-accent-600 hover:bg-accent-500 text-white text-xs rounded">
                        {(index + 1) * 200} Gold
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <h3 className="text-sm font-medium text-white mb-3">Your Gold</h3>
                  <div className="flex items-center">
                    <Image 
                      src="/images/fire-emblem/gold.png"
                      alt="Gold"
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    <span className="text-xl font-bold text-yellow-400">1,250</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
      
      {/* Bottom Navigation */}
      <nav className="bg-dark/90 backdrop-blur-lg fixed bottom-0 w-full border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around h-16">
            <Link href="/dashboard" className="flex flex-col items-center justify-center w-full text-accent-400">
              <span className="text-xs">Dashboard</span>
            </Link>
            <Link href="/quests" className="flex flex-col items-center justify-center w-full text-gray-500 hover:text-gray-300">
              <span className="text-xs">Quests</span>
            </Link>
            <Link href="/party" className="flex flex-col items-center justify-center w-full text-gray-500 hover:text-gray-300">
              <span className="text-xs">Party</span>
            </Link>
            <Link href="/settings" className="flex flex-col items-center justify-center w-full text-gray-500 hover:text-gray-300">
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
} 