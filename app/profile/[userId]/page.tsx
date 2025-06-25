'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/store/authStore'
import { Character, Race, CharacterClass, Gender } from '@/store/userStore'
import { ALL_EQUIPMENT, Equipment } from '@/types/equipment'
import { getCharacterImagePathWithSeed } from '@/utils/characterImage'

// Race descriptions and bonuses
const RACE_INFO = {
  human: {
    description: "Versatile and adaptable, humans excel in social situations and can learn any skill quickly.",
    bonuses: {
      wisdom: 2,
      charisma: 2
    }
  },
  elf: {
    description: "Graceful and intelligent, elves have a natural affinity for magic and archery.",
    bonuses: {
      intelligence: 2,
      dexterity: 2
    }
  },
  dwarf: {
    description: "Sturdy and resilient, dwarves are masters of crafting and combat.",
    bonuses: {
      constitution: 2,
      strength: 2
    }
  },
  orc: {
    description: "Powerful and intimidating, orcs are natural warriors with incredible strength.",
    bonuses: {
      strength: 2,
      constitution: 2
    }
  },
  kitsune: {
    description: "Agile and cunning, kitsune are masters of illusion and quick combat.",
    bonuses: {
      dexterity: 2,
      intelligence: 2
    }
  }
}

const EQUIPMENT_SLOT_DISPLAY: Record<string, string> = {
  helm: 'Helm',
  top: 'Top',
  bottom: 'Bottom',
  secondary: 'Secondary',
  weapon: 'Weapon',
  gloves: 'Gloves',
  shoes: 'Shoes',
  pendant: 'Pendant',
  accessory: 'Accessory',
  consumable: 'Consumable',
}

type UserProfileData = {
  username?: string
  email?: string
  character?: Character
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user: currentUser } = useAuthStore()

  const userId = params.userId as string

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError('User ID not provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const userRef = doc(db, 'users', userId)
        const userDoc = await getDoc(userRef)

        if (!userDoc.exists()) {
          setError('User not found')
          setLoading(false)
          return
        }

        const data = userDoc.data()
        setUserData({
          username: data.username,
          email: data.email,
          character: data.character
        })
      } catch (err: any) {
        console.error('Error fetching user profile:', err)
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-display text-white mb-4">Profile Not Found</h1>
            <p className="text-gray-400 mb-6">{error || 'Unable to load profile'}</p>
            <Link href="/social" className="btn btn-primary">
              Back to Social
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const character = userData.character
  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-display text-white mb-4">Profile Not Found</h1>
            <p className="text-gray-400 mb-6">This user hasn't created their character yet.</p>
            <Link href="/social" className="btn btn-primary">
              Back to Social
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const raceInfo = RACE_INFO[character.race as keyof typeof RACE_INFO]

  // Hydrate equipment with full item data
  const hydratedEquipment = Object.fromEntries(
    Object.entries(character.equipment || {}).map(([slot, item]) => [
      slot,
      item && typeof item === 'object' && item.id ? item : ALL_EQUIPMENT.find(e => e.id === (item?.id || item)) || null
    ])
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          className="bg-dark/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/social" className="text-primary-400 hover:text-primary-300">
              ← Back to Social
            </Link>
            {currentUser && currentUser.uid === userId && (
              <Link href="/profile" className="text-accent-400 hover:text-accent-300">
                Edit My Profile
              </Link>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image and Basic Info */}
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-primary-500">
                <Image 
                  src={getCharacterImagePathWithSeed(character.race || 'human', character.gender || 'male', character.id)}
                  alt="Profile"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-display text-white">{character.name || 'Adventurer'}</h2>
                {character.appliedTitle && (
                  <p className="text-lg text-accent-400 font-medium mt-1">{character.appliedTitle}</p>
                )}
                <p className="text-sm text-gray-400">
                  Level {character.level || 1} {character.race || 'Human'} {character.class || 'Warrior'}
                </p>
                <div className="mt-2">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500" 
                      style={{ width: `${((character.experience || 0) / (character.nextLevelXp || 100)) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {character.experience || 0} / {character.nextLevelXp || 100} XP
                  </p>
                </div>
              </div>
            </div>

            {/* Character Information */}
            <div className="flex-1 space-y-6">
              {/* Race Description */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-2">Race: {character.race}</h3>
                <p className="text-gray-300">{raceInfo?.description}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Racial Bonuses:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(raceInfo?.bonuses || {}).map(([stat, bonus]) => (
                      <div key={stat} className="flex items-center justify-between bg-gray-700/50 rounded px-3 py-1">
                        <span className="text-gray-300 capitalize">{stat}</span>
                        <span className="text-primary-400">+{bonus}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Character Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(character.stats || {}).map(([stat, value]) => (
                    <div key={stat} className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 capitalize">{stat}</label>
                      <p className="mt-1 text-xl font-bold text-primary-400">{value}</p>
                      {raceInfo?.bonuses[stat as keyof typeof raceInfo.bonuses] && (
                        <p className="text-xs text-primary-300">
                          +{raceInfo.bonuses[stat as keyof typeof raceInfo.bonuses]} from race
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Equipment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(hydratedEquipment)
                    .filter(([slot]) => Object.keys(EQUIPMENT_SLOT_DISPLAY).includes(slot))
                    .map(([slot, item]) => (
                      <div key={slot} className="bg-gray-700/50 rounded-lg p-4 h-[120px] flex flex-col items-center justify-center">
                        <label className="block text-sm font-medium text-gray-400 capitalize mb-2">{EQUIPMENT_SLOT_DISPLAY[slot]}</label>
                        {item ? (
                          <>
                            <div className="w-12 h-12 mb-2 flex items-center justify-center">
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                width={48} 
                                height={48} 
                                className="opacity-90"
                              />
                            </div>
                            <p className="text-white text-sm text-center line-clamp-1">{item.name}</p>
                            <p className="text-gray-400 text-xs mt-1">Level {item.level}</p>
                          </>
                        ) : (
                          <div className="text-center">
                            <p className="text-gray-400 text-sm">No {EQUIPMENT_SLOT_DISPLAY[slot]} equipped</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Skills */}
              {Object.keys(character.skills || {}).length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Skills</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(character.skills || {}).map(([skillName, level]) => (
                      <div key={skillName} className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-white font-medium">{skillName}</h4>
                          </div>
                          <span className="text-primary-400">Level {level}/10</span>
                        </div>
                        <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500" 
                            style={{ width: `${(level / 10) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Max Level: 10
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Titles */}
              {currentUser && currentUser.uid === userId && character.titles && character.titles.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Titles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {character.titles.map((title) => (
                      <div key={title} className="bg-gray-700/50 rounded-lg p-4">
                        <h4 className="text-white font-medium">{title}</h4>
                        {character.appliedTitle === title && (
                          <p className="text-xs text-accent-400 mt-1">Currently Applied</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 