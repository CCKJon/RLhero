'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useUserStore, Quest, getMaxAcceptedQuests } from '@/store/userStore'
import type { QuestCategory } from '@/store/userStore'
import QuestModal from '@/components/QuestModal'
import AddQuestModal from '@/components/AddQuestModal'
import { getQuestIcon } from '@/utils/questUtils'

export default function Quests() {
  const { quests, character, actions: { addQuest, acceptQuest } } = useUserStore()
  const [selectedTab, setSelectedTab] = useState<'daily' | 'available' | 'accepted' | 'completed'>('daily')
  const [questFilter, setQuestFilter] = useState<'All' | QuestCategory>('All')
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddQuestModalOpen, setIsAddQuestModalOpen] = useState(false)
  const [newQuest, setNewQuest] = useState({ 
    name: '', 
    category: 'Wellness' as QuestCategory,
  })

  const filteredQuests = quests.filter(
    quest => questFilter === 'All' || quest.category === questFilter
  )

  const acceptedQuests = filteredQuests.filter(q => q.accepted && !q.completed)
  const availableQuests = filteredQuests.filter(q => !q.accepted && !q.completed)
  const completedQuests = filteredQuests.filter(q => q.completed)

  const handleAddQuest = (questData: {
    name: string
    category: QuestCategory
    description: string
    reward: number
    goldReward: number
    itemReward: string
  }) => {
    addQuest({
      name: questData.name,
      reward: questData.reward,
      completed: false,
      category: questData.category,
      accepted: false,
      description: questData.description,
      goldReward: questData.goldReward,
      itemReward: questData.itemReward
    })
    setIsAddQuestModalOpen(false)
  }

  const handleQuestClick = (quest: Quest) => {
    setSelectedQuest(quest)
    setIsModalOpen(true)
  }

  const handleAcceptQuest = async () => {
    if (selectedQuest) {
      await acceptQuest(selectedQuest.id)
      setIsModalOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-dark">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-display text-white">Quests</h1>
          <p className="text-gray-400 text-sm sm:text-base">Complete quests to gain experience and rewards</p>
          <div className="mt-2 px-4 py-2 bg-dark/50 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg inline-block">
            <p className="text-sm font-medium text-gray-300">Accepted Quests</p>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {acceptedQuests.length}/{getMaxAcceptedQuests(character?.level || 1)}
            </p>
          </div>
        </div>

        {/* Mobile Tab Bar - full width, scrollable, no dropdown */}
        <div className="w-full sm:hidden">
          <div className="flex overflow-x-auto whitespace-nowrap gap-2 no-scrollbar px-2 py-2 border-b border-gray-800 mb-4">
            {['daily', 'available', 'accepted', 'completed'].map(tab => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap flex-shrink-0 ${selectedTab === tab ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                style={{ minWidth: 80 }}
                onClick={() => setSelectedTab(tab as any)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Quests
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Tab Bar */}
        <div className="hidden sm:flex border-b border-gray-800 mb-6 gap-2 overflow-x-auto px-0">
          {['daily', 'available', 'accepted', 'completed'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${selectedTab === tab ? 'text-accent-400 border-b-2 border-accent-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setSelectedTab(tab as any)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Quests
            </button>
          ))}
        </div>

        {/* Quest Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2 px-4 sm:px-0">
          {['All', 'Wellness', 'Education', 'Fitness', 'Health', 'Skills'].map((category) => (
            <button
              key={category}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
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
            <div className="px-4 sm:px-0">
              <div className="space-y-3 sm:space-y-4">
                {filteredQuests.filter(q => !q.completed).map((quest) => (
                  <div 
                    key={quest.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleQuestClick(quest)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-900 rounded-md flex-shrink-0 flex items-center justify-center mr-3">
                          <Image 
                            src={character ? getQuestIcon(quest, character) : "/images/fire-emblem/quest-1.png"}
                            alt="Quest"
                            width={32}
                            height={32}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate max-w-48 sm:max-w-64">{quest.name}</h3>
                          <p className="text-sm text-gray-400 truncate">{quest.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center ml-2">
                        <span className="text-xs bg-accent-900/50 text-accent-300 px-2 py-1 rounded whitespace-nowrap">
                          +{quest.reward} XP
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Quest Form */}
                <div className="mt-6 sm:mt-8">
                  <h3 className="text-sm font-medium text-white mb-3">Add Custom Quest</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newQuest.name}
                      onChange={(e) => setNewQuest({ ...newQuest, name: e.target.value })}
                      placeholder="Enter quest name..."
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
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
                      onClick={() => setIsAddQuestModalOpen(true)}
                      className="btn btn-primary text-sm"
                      disabled={!newQuest.name}
                    >
                      Add Quest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'available' && (
            <div className="px-4 sm:px-0">
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
                            src={character ? getQuestIcon(quest, character) : "/images/fire-emblem/quest-1.png"}
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
          )}

          {selectedTab === 'accepted' && (
            <div className="space-y-4">
              {acceptedQuests.map((quest) => (
                <div 
                  key={quest.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleQuestClick(quest)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
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
          )}

          {selectedTab === 'completed' && (
            <div className="space-y-4">
              {completedQuests.map((quest) => (
                <div 
                  key={quest.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <h3 className="text-white font-medium">{quest.name}</h3>
                        <p className="text-sm text-gray-400">{quest.category}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Completed on: {quest.dateCompleted ? new Date(quest.dateCompleted).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-accent-900/50 text-accent-300 px-2 py-1 rounded">
                        +{quest.reward} XP
                      </span>
                      {quest.goldReward && (
                        <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded">
                          +{quest.goldReward} Gold
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Quest Modal */}
      <QuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quest={selectedQuest}
        onAccept={handleAcceptQuest}
      />

      {/* Add Quest Modal */}
      <AddQuestModal
        isOpen={isAddQuestModalOpen}
        onClose={() => setIsAddQuestModalOpen(false)}
        onSubmit={handleAddQuest}
        initialQuestName={newQuest.name}
      />
    </div>
  )
} 