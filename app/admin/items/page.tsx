'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { db, storage } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Item, EquipmentSlot } from '@/types/equipment'

const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  'helm',
  'top',
  'bottom',
  'shoes',
  'gloves',
  'pendant',
  'consumable',
  'weapon',
  'secondary',
  'accessory'
]

const RARITY_OPTIONS = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary'
]

export default function AdminItems() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<Partial<Item>>({
    name: '',
    description: '',
    cost: 0,
    stats: {
      strength: 0,
      intelligence: 0,
      dexterity: 0,
      wisdom: 0,
      constitution: 0,
      charisma: 0,
      damage: 0,
      defense: 0,
      magicDefense: 0,
      criticalChance: 0,
      dodgeChance: 0
    },
    specialEffects: [],
    slot: 'weapon',
    rarity: 'common'
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.startsWith('stats.')) {
      const statName = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          [statName]: parseInt(value) || 0
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Upload image if selected
      let imageUrl = ''
      if (imageFile) {
        const storageRef = ref(storage, `items/${Date.now()}_${imageFile.name}`)
        await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(storageRef)
      }

      // Create item document
      const itemData: Omit<Item, 'id'> = {
        ...formData as Omit<Item, 'id'>,
        imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await addDoc(collection(db, 'items'), itemData)
      router.push('/admin/items')
    } catch (err: any) {
      setError(err.message || 'Failed to create item')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Item</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cost</label>
              <input
                type="number"
                name="cost"
                required
                min="0"
                value={formData.cost}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Slot</label>
              <select
                name="slot"
                required
                value={formData.slot}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
              >
                {EQUIPMENT_SLOTS.map(slot => (
                  <option key={slot} value={slot}>
                    {slot.charAt(0).toUpperCase() + slot.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rarity</label>
              <select
                name="rarity"
                required
                value={formData.rarity}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
              >
                {RARITY_OPTIONS.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stats</label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {Object.entries(formData.stats || {}).map(([stat, value]) => (
                  <div key={stat}>
                    <label className="block text-sm text-gray-600">
                      {stat.charAt(0).toUpperCase() + stat.slice(1)}
                    </label>
                    <input
                      type="number"
                      name={`stats.${stat}`}
                      value={formData.stats?.[stat as keyof typeof formData.stats] || 0}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Item Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Item'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
} 