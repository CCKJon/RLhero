'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useUserStore, Character, Quest, QuestCategory, getMaxAcceptedQuests } from '@/store/userStore'
import { redirect } from 'next/navigation'
import { Equipment, ARMOR_SETS, ArmorSet } from '@/types/equipment'
import QuestModal from '@/components/QuestModal'
import ItemModal from '@/components/ItemModal'
import LevelUpModal from '@/components/LevelUpModal'

export default function Dashboard() {
  const { 
    character, 
    quests, 
    showLevelUpModal,
    levelUpRewards,
    actions: { 
      toggleQuestComplete, 
      addQuest,
      gainExperience,
      unequipItem,
      acceptQuest,
      closeLevelUpModal
    } 
  } = useUserStore()
  
  const [selectedTab, setSelectedTab] = useState<'quests' | 'stats' | 'inventory'>('quests')
  const [questFilter, setQuestFilter] = useState<'All' | QuestCategory>('All')
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null)
  
  // If no character, redirect to registration
  useEffect(() => {
    if (!character) {
      redirect('/register')
    }
  }, [character])
  
  if (!character) return null // Prevent rendering during redirect
  
  const handleQuestToggle = (id: string) => {
    toggleQuestComplete(id)
  }
  
  const handleQuestClick = (quest: Quest) => {
    setSelectedQuest(quest)
    setIsModalOpen(true)
  }

  const handleAcceptQuest = async (quest: Quest) => {
    try {
      await acceptQuest(quest.id)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to accept quest:', error)
    }
  }

  const handleUnequipItem = async (slot: 'weapon' | 'armor' | 'accessory') => {
    try {
      await unequipItem(slot)
    } catch (error) {
      console.error('Failed to unequip item:', error)
    }
  }

  const acceptedQuests = quests.filter(q => q.accepted && !q.completed)
  const availableQuests = quests.filter(q => !q.accepted && !q.completed)

  // Clamp experience and percentage for display
  const displayedExperience = Math.max(0, character.experience);
  const displayedNextLevelXp = character.nextLevelXp;
  const displayedPercent = Math.max(0, Math.round((displayedExperience / displayedNextLevelXp) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-dark">
      {/* Hero Banner */}
      <div className="relative w-full h-64 overflow-hidden">
        {/* Banner background overlay - ensure z-0 so header is above */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-accent-900/80 z-0 pointer-events-none"></div>
        <Image 
          src="/images/fire-emblem/banner-bg.jpg" 
          alt=""
          width={1920}
          height={400}
          className="w-full h-full object-cover z-0 pointer-events-none"
          priority
          aria-hidden="true"
        />
        {/* Banner content overlay - ensure z-10 so header (z-10 sticky) is above */}
        <div className="absolute inset-0 z-10 flex items-center px-8">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white drop-shadow-lg">
              Welcome back, <span className="text-accent-400">{character.name}</span>
            </h1>
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
                
                {/* Currency Display */}
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center">
                    <Image 
                      src="/images/fire-emblem/gold-coin.png" 
                      alt="Gold" 
                      width={20} 
                      height={20}
                      className="mr-1"
                    />
                    <span className="text-sm text-yellow-400">{character.gold || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <Image 
                      src="/images/fire-emblem/sp-coin.png" 
                      alt="SP" 
                      width={20} 
                      height={20}
                      className="mr-1"
                    />
                    <span className="text-sm text-purple-400">{character.sp || 0}</span>
                  </div>
                </div>
                
                {/* XP Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Experience: {displayedExperience}/{displayedNextLevelXp}</span>
                    <span>{displayedPercent}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-500" 
                      style={{ width: `${displayedPercent}%` }}
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
                    {Object.keys(character.skills).length}
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
        
        {/* Quest Count Display */}
        <div className="flex justify-end mb-4">
          <div className="px-4 py-2 bg-dark/50 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg">
            <p className="text-sm font-medium text-gray-300">Accepted Quests</p>
            <p className="text-2xl font-bold text-white">
              {acceptedQuests.length}/{getMaxAcceptedQuests(character.level)}
            </p>
          </div>
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
                    onClick={() => setQuestFilter(category as 'All' | QuestCategory)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Accepted Quests */}
              {acceptedQuests.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-white mb-4">Accepted Quests</h3>
                  <div className="space-y-4">
                    {acceptedQuests.map((quest) => (
                      <div 
                        key={quest.id}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
                        onClick={() => handleQuestClick(quest)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={quest.completed}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleQuestToggle(quest.id)
                              }}
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
                  </div>
                </div>
              )}

              {/* Available Quests */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-white mb-4">Available Quests</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableQuests.map((quest) => (
                    <div 
                      key={quest.id} 
                      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 cursor-pointer hover:bg-gray-600/50 transition-colors"
                      onClick={() => handleQuestClick(quest)}
                    >
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-primary-900 rounded-md flex-shrink-0 flex items-center justify-center mr-3">
                          <Image 
                            src={`/images/fire-emblem/quest-${Math.floor(Math.random() * 4) + 1}.png`}
                            alt="Quest"
                            width={32}
                            height={32}
                          />
                        </div>
                        <div>
                          <h4 className="text-white text-sm font-medium">{quest.name}</h4>
                          <p className="text-gray-400 text-xs mt-1">Category: {quest.category}</p>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs bg-primary-900/50 text-primary-300 px-2 py-1 rounded mr-2">
                              +{quest.reward} XP
                            </span>
                            {quest.goldReward && (
                              <span className="text-xs bg-accent-900/50 text-accent-300 px-2 py-1 rounded">
                                +{quest.goldReward} Gold
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                  {Object.keys(character.skills).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No skills learned yet.</p>
                      <p className="text-sm text-gray-500 mt-1">Complete quests to level up your skills!</p>
                    </div>
                  ) : (
                    Object.entries(character.skills).map(([skillName, level]) => (
                      <div key={skillName}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{skillName}</span>
                          <span className="text-gray-400">Level {level}</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500" 
                            style={{ width: `${(level / 10) * 100}%` }}
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
                    <div 
                      key={slot} 
                      className="bg-gray-700/50 rounded-lg p-4 relative cursor-pointer hover:border-gray-600 transition-colors"
                      onClick={() => item && setSelectedItem(item)}
                    >
                      {item ? (
                        <>
                          <div className="w-full h-16 mb-2 flex items-center justify-center">
                            <Image 
                              src={item.image} 
                              alt={item.name} 
                              width={48} 
                              height={48} 
                              className="opacity-90"
                            />
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-white">{item.name}</p>
                            <span className="text-xs text-gray-400">Level {item.level}</span>
                          </div>
                          
                          {/* Stats */}
                          <div className="space-y-1 mb-2">
                            {typeof item === 'object' && item.stats ? (
                              Object.entries(item.stats).map(([stat, value]) => (
                                <div key={stat} className="flex justify-between text-xs">
                                  <span className="text-gray-400 capitalize">{stat}</span>
                                  <span className="text-primary-400">+{value}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-gray-400">No stats available</div>
                            )}
                          </div>

                          {/* Set Info */}
                          {item.set && (
                            <div className="mt-2 p-2 bg-gray-600/30 rounded text-xs">
                              <p className="text-gray-300">Part of {item.set}</p>
                            </div>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnequipItem(slot as 'weapon' | 'armor' | 'accessory');
                            }}
                            className="mt-2 w-full py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                          >
                            Unequip
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-400 capitalize">{slot}</p>
                          <p className="text-xs text-gray-500 mt-1">Empty</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Set Bonuses */}
                {Object.values(character.equipment).some(item => item?.set) && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-white mb-3">Active Set Bonuses</h4>
                    <div className="space-y-3">
                      {ARMOR_SETS.map((set: ArmorSet) => {
                        const equippedPieces = Object.values(character.equipment).filter(
                          item => item?.set === set.name
                        );
                        
                        if (equippedPieces.length === 0) return null;

                        return (
                          <div key={set.name} className="bg-gray-700/30 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-white">{set.name}</span>
                              <span className="text-xs text-gray-400">
                                {equippedPieces.length}/{set.pieces.length} pieces
                              </span>
                            </div>
                            
                            {Object.entries(set.bonuses).map(([pieceCount, bonus]) => {
                              const isActive = equippedPieces.length >= parseInt(pieceCount);
                              return (
                                <div 
                                  key={pieceCount} 
                                  className={`text-xs ${isActive ? 'text-primary-400' : 'text-gray-500'}`}
                                >
                                  {pieceCount} pieces: {Object.entries(bonus as Record<string, number>).map(([stat, value]) => (
                                    <span key={stat} className="mr-2">
                                      +{value} {stat}
                                    </span>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Titles */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Titles</h3>
                <div className="grid grid-cols-1 gap-3">
                  {character.titles.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No titles earned yet.</p>
                      <p className="text-sm text-gray-500 mt-1">Complete achievements to earn titles!</p>
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
            <div className="grid gap-6 grid-cols-1">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Inventory</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {character.inventory
                    .filter(item => !Object.values(character.equipment).some(equippedItem => equippedItem?.id === item.id))
                    .map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 cursor-pointer hover:border-gray-500 transition-colors"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-primary-900 rounded-md flex-shrink-0 flex items-center justify-center mr-3">
                          <Image 
                            src={item.image}
                            alt={item.name}
                            width={32}
                            height={32}
                          />
                        </div>
                        <div>
                          <h4 className="text-white text-sm font-medium">{item.name}</h4>
                          <p className="text-gray-400 text-xs mt-1">Level {item.level}</p>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs bg-primary-900/50 text-primary-300 px-2 py-1 rounded">
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Modals */}
      {selectedQuest && (
        <QuestModal
          isOpen={!!selectedQuest}
          quest={selectedQuest}
          onClose={() => setSelectedQuest(null)}
          onAccept={handleAcceptQuest}
        />
      )}

      {selectedItem && (
        <ItemModal
          isOpen={!!selectedItem}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={closeLevelUpModal}
        newLevel={character.level}
        rewards={levelUpRewards || { gold: 0, items: [] }}
      />
    </div>
  )
} 