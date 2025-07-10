'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUserStore, Habit } from '@/store/userStore'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { FaPlus, FaEdit, FaTrash, FaFire, FaLink, FaUnlink, FaCalendar, FaTrophy } from 'react-icons/fa'

type HabitModalProps = {
  isOpen: boolean
  onClose: () => void
  habit?: Habit | null
  mode: 'create' | 'edit'
}

const HabitModal = ({ isOpen, onClose, habit, mode }: HabitModalProps) => {
  const { actions: { addHabit, updateHabit } } = useUserStore()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'morning' as Habit['category'],
    baseReward: 25
  })

  useEffect(() => {
    if (habit && mode === 'edit') {
      setFormData({
        name: habit.name,
        description: habit.description || '',
        category: habit.category,
        baseReward: habit.baseReward
      })
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'morning',
        baseReward: 25
      })
    }
  }, [habit, mode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (mode === 'create') {
        await addHabit(formData)
      } else if (habit) {
        await updateHabit(habit.id, formData)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save habit:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-display text-white mb-4">
          {mode === 'create' ? 'New Habit' : 'Edit Habit'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Habit['category'] }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="morning">🌅 Morning Routine</option>
              <option value="evening">🌙 Evening Routine</option>
              <option value="weekly">📅 Weekly Goal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Base Reward (XP)
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={formData.baseReward}
              onChange={(e) => setFormData(prev => ({ ...prev, baseReward: parseInt(e.target.value) }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium"
            >
              {mode === 'create' ? 'Create Habit' : 'Update Habit'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

type HabitChainModalProps = {
  isOpen: boolean
  onClose: () => void
}

const HabitChainModal = ({ isOpen, onClose }: HabitChainModalProps) => {
  const { actions: { createHabitChain } } = useUserStore()
  const [habits, setHabits] = useState([
    { name: '', description: '', category: 'morning' as Habit['category'], baseReward: 25 }
  ])

  const addHabit = () => {
    setHabits(prev => [...prev, { name: '', description: '', category: 'morning', baseReward: 25 }])
  }

  const removeHabit = (index: number) => {
    if (habits.length > 1) {
      setHabits(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateHabit = (index: number, field: string, value: any) => {
    setHabits(prev => prev.map((habit, i) => 
      i === index ? { ...habit, [field]: value } : habit
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createHabitChain(habits)
      onClose()
      setHabits([{ name: '', description: '', category: 'morning', baseReward: 25 }])
    } catch (error) {
      console.error('Failed to create habit chain:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-display text-white mb-4">Create Habit Chain</h2>
        <p className="text-gray-400 mb-6">Create a sequence of habits that build upon each other for increased rewards.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {habits.map((habit, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-white">Habit {index + 1}</h3>
                {habits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHabit(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={habit.name}
                    onChange={(e) => updateHabit(index, 'name', e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={habit.category}
                    onChange={(e) => updateHabit(index, 'category', e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="morning">🌅 Morning</option>
                    <option value="evening">🌙 Evening</option>
                    <option value="weekly">📅 Weekly</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={habit.description}
                  onChange={(e) => updateHabit(index, 'description', e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-20 resize-none"
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addHabit}
            className="w-full bg-gray-700 hover:bg-gray-600 border-2 border-dashed border-gray-500 text-gray-300 py-4 rounded-lg flex items-center justify-center gap-2"
          >
            <FaPlus />
            Add Another Habit
          </button>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium"
            >
              Create Chain
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Habits() {
  const { character, actions: { completeHabit, deleteHabit } } = useUserStore()
  const { isLoading: isAuthLoading } = useAuthStore()
  const router = useRouter()
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | Habit['category']>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isChainModalOpen, setIsChainModalOpen] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  // If no character and not loading, redirect to registration
  useEffect(() => {
    if (!character && !isAuthLoading) {
      router.push('/register')
    }
  }, [character, isAuthLoading])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!character) return null

  const habits = character.habits || []

  const filteredHabits = habits.filter(habit => 
    selectedCategory === 'all' || habit.category === selectedCategory
  )

  const groupedHabits = filteredHabits.reduce((acc, habit) => {
    if (!acc[habit.category]) {
      acc[habit.category] = []
    }
    acc[habit.category].push(habit)
    return acc
  }, {} as Record<Habit['category'], Habit[]>)

  const handleCreateHabit = () => {
    setSelectedHabit(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleCompleteHabit = async (id: string) => {
    try {
      await completeHabit(id)
    } catch (error) {
      console.error('Failed to complete habit:', error)
    }
  }

  const handleDeleteHabit = async (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      try {
        await deleteHabit(id)
      } catch (error) {
        console.error('Failed to delete habit:', error)
      }
    }
  }

  const isHabitCompletedToday = (habit: Habit) => {
    if (!habit.lastCompletedDate) return false
    const today = new Date()
    const lastCompleted = new Date(habit.lastCompletedDate)
    return today.toDateString() === lastCompleted.toDateString()
  }

  const getCategoryIcon = (category: Habit['category']) => {
    switch (category) {
      case 'morning': return '🌅'
      case 'evening': return '🌙'
      case 'weekly': return '📅'
      default: return '📋'
    }
  }

  const getCategoryName = (category: Habit['category']) => {
    switch (category) {
      case 'morning': return 'Morning Routine'
      case 'evening': return 'Evening Routine'
      case 'weekly': return 'Weekly Goals'
      default: return 'Other'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-white">Habits</h1>
          <p className="text-gray-400">Build consistent routines and track your progress</p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCreateHabit}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <FaPlus />
              New Habit
            </button>
            
            <button
              onClick={() => setIsChainModalOpen(true)}
              className="bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <FaLink />
              Create Habit Chain
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {['all', 'morning', 'evening', 'weekly'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {category === 'all' ? '📋' : getCategoryIcon(category as Habit['category'])}
                {category === 'all' ? 'All' : getCategoryName(category as Habit['category'])}
              </button>
            ))}
          </div>
        </div>

        {/* Habits by Category */}
        <div className="space-y-8">
          {Object.entries(groupedHabits).map(([category, categoryHabits]) => (
            <div key={category}>
              <h2 className="text-xl font-medium text-white mb-4 flex items-center gap-2">
                {getCategoryIcon(category as Habit['category'])}
                {getCategoryName(category as Habit['category'])}
                <span className="text-gray-400 text-sm">({categoryHabits.length})</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryHabits.map(habit => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border transition-all ${
                      isHabitCompletedToday(habit)
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-1">{habit.name}</h3>
                        {habit.description && (
                          <p className="text-gray-400 text-sm mb-2">{habit.description}</p>
                        )}
                        
                        {/* Streak Display */}
                        <div className="flex items-center gap-2 mb-3">
                          <FaFire className="text-orange-500" />
                          <span className="text-sm text-gray-300">
                            {habit.streak} day{habit.streak !== 1 ? 's' : ''} streak
                          </span>
                          {habit.maxStreak > habit.streak && (
                            <span className="text-xs text-gray-500">
                              (Best: {habit.maxStreak})
                            </span>
                          )}
                        </div>

                        {/* Chain Indicator */}
                        {habit.chainId && (
                          <div className="flex items-center gap-2 mb-3">
                            <FaLink className="text-blue-500" />
                            <span className="text-sm text-gray-300">
                              Chain #{habit.chainPosition! + 1}
                            </span>
                          </div>
                        )}

                        {/* Multiplier Display */}
                        {habit.currentMultiplier > 1 && (
                          <div className="flex items-center gap-2 mb-3">
                            <FaTrophy className="text-yellow-500" />
                            <span className="text-sm text-yellow-400">
                              {Math.round(habit.currentMultiplier * 100)}% bonus
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditHabit(habit)}
                          className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"
                          title="Edit habit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                          title="Delete habit"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* Reward Info */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Base Reward:</span>
                        <span className="text-primary-400">{habit.baseReward} XP</span>
                      </div>
                      {habit.currentMultiplier > 1 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">With Bonus:</span>
                          <span className="text-yellow-400">
                            {Math.floor(habit.baseReward * habit.currentMultiplier)} XP
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Complete Button */}
                    <button
                      onClick={() => handleCompleteHabit(habit.id)}
                      disabled={isHabitCompletedToday(habit)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        isHabitCompletedToday(habit)
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      {isHabitCompletedToday(habit) ? 'Completed Today' : 'Complete Habit'}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredHabits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-2">No habits found</p>
            <p className="text-gray-500">Create your first habit to start building positive routines!</p>
          </div>
        )}
      </div>

      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        habit={selectedHabit}
        mode={modalMode}
      />

      <HabitChainModal
        isOpen={isChainModalOpen}
        onClose={() => setIsChainModalOpen(false)}
      />
    </div>
  )
} 