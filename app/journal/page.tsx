'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUserStore, JournalEntry } from '@/store/userStore'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSearch, FaTag } from 'react-icons/fa'

type JournalModalProps = {
  isOpen: boolean
  onClose: () => void
  entry?: JournalEntry | null
  mode: 'create' | 'edit'
}

const JournalModal = ({ isOpen, onClose, entry, mode }: JournalModalProps) => {
  const { actions: { addJournalEntry, updateJournalEntry } } = useUserStore()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral' as JournalEntry['mood'],
    tags: [] as string[],
    isPrivate: false
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (entry && mode === 'edit') {
      setFormData({
        title: entry.title,
        content: entry.content,
        mood: entry.mood || 'neutral',
        tags: entry.tags,
        isPrivate: entry.isPrivate
      })
    } else {
      setFormData({
        title: '',
        content: '',
        mood: 'neutral',
        tags: [],
        isPrivate: false
      })
    }
  }, [entry, mode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (mode === 'create') {
        await addJournalEntry(formData)
      } else if (entry) {
        await updateJournalEntry(entry.id, formData)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save journal entry:', error)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
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
        <h2 className="text-2xl font-display text-white mb-4">
          {mode === 'create' ? 'New Journal Entry' : 'Edit Journal Entry'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-32 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mood
            </label>
            <select
              value={formData.mood}
              onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value as JournalEntry['mood'] }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="great">😊 Great</option>
              <option value="good">🙂 Good</option>
              <option value="neutral">😐 Neutral</option>
              <option value="bad">😕 Bad</option>
              <option value="terrible">😢 Terrible</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-primary-600 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  <FaTag className="text-xs" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-300">
              Private entry (only visible to you)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium"
            >
              {mode === 'create' ? 'Create Entry' : 'Update Entry'}
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

export default function Journal() {
  const { character, actions: { deleteJournalEntry } } = useUserStore()
  const { isLoading: isAuthLoading } = useAuthStore()
  const router = useRouter()
  
  const [selectedTab, setSelectedTab] = useState<'all' | 'private' | 'public'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMood, setSelectedMood] = useState<JournalEntry['mood'] | 'all'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
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

  const journalEntries = character.journalEntries || []

  const filteredEntries = journalEntries.filter(entry => {
    const matchesTab = selectedTab === 'all' || 
      (selectedTab === 'private' && entry.isPrivate) ||
      (selectedTab === 'public' && !entry.isPrivate)
    
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood

    return matchesTab && matchesSearch && matchesMood
  })

  const sortedEntries = filteredEntries.sort((a, b) => 
    new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
  )

  const handleCreateEntry = () => {
    setSelectedEntry(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      try {
        await deleteJournalEntry(id)
      } catch (error) {
        console.error('Failed to delete journal entry:', error)
      }
    }
  }

  const getMoodEmoji = (mood: JournalEntry['mood']) => {
    switch (mood) {
      case 'great': return '😊'
      case 'good': return '🙂'
      case 'neutral': return '😐'
      case 'bad': return '😕'
      case 'terrible': return '😢'
      default: return '😐'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-white">Journal</h1>
          <p className="text-gray-400">Reflect on your journey and track your progress</p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCreateEntry}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <FaPlus />
              New Entry
            </button>
            
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Tab Filter */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              {['all', 'public', 'private'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedTab === tab
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Mood Filter */}
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Moods</option>
              <option value="great">😊 Great</option>
              <option value="good">🙂 Good</option>
              <option value="neutral">😐 Neutral</option>
              <option value="bad">😕 Bad</option>
              <option value="terrible">😢 Terrible</option>
            </select>
          </div>
        </div>

        {/* Journal Entries */}
        <div className="space-y-4">
          {sortedEntries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-2">No journal entries found</p>
              <p className="text-gray-500">Create your first entry to start reflecting on your journey!</p>
            </div>
          ) : (
            sortedEntries.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-medium text-white">{entry.title}</h3>
                      <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                      {entry.isPrivate && (
                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <FaEyeSlash />
                          Private
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {new Date(entry.dateCreated).toLocaleDateString()} • 
                      {new Date(entry.dateCreated).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"
                      title="Edit entry"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                      title="Delete entry"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{entry.content}</p>
                </div>

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-primary-600/20 text-primary-300 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        <FaTag className="text-xs" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      <JournalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entry={selectedEntry}
        mode={modalMode}
      />
    </div>
  )
} 