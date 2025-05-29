'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import type { Race, Gender, Character } from '@/store/userStore'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'
import { ALL_EQUIPMENT } from '@/types/equipment'

export default function Register() {
  const router = useRouter()
  const { actions: userActions } = useUserStore()
  const { actions: authActions } = useAuthStore()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    characterName: '',
    race: '' as Race,
    gender: '' as Gender,
    appearance: {
      hairStyle: 0,
      hairColor: '#000000',
      eyeColor: '#000000',
      skinTone: '#f5d7b8',
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData] as any,
          [child]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      try {
        // Register the user first
        await authActions.register(formData.email, formData.password, formData.username)
        
        // Create default character
        const newCharacter: Character = {
          id: Math.random().toString(36).substring(2, 9),
          name: formData.characterName,
          race: formData.race,
          gender: formData.gender,
          level: 1,
          experience: 0,
          nextLevelXp: 100,
          stats: {
            strength: formData.race === 'orc' ? 12 : formData.race === 'dwarf' ? 10 : 8,
            intelligence: formData.race === 'elf' ? 12 : formData.race === 'kitsune' ? 10 : 8,
            dexterity: formData.race === 'kitsune' ? 12 : formData.race === 'elf' ? 10 : 8,
            wisdom: formData.race === 'human' ? 10 : 8,
            constitution: formData.race === 'dwarf' ? 12 : formData.race === 'orc' ? 10 : 8,
            charisma: formData.race === 'human' ? 12 : 8
          },
          skills: [],
          equipment: {
            weapon: ALL_EQUIPMENT.find(e => e.name === getRaceDefaultWeapon(formData.race) && e.type === 'weapon') || null,
            armor: ALL_EQUIPMENT.find(e => e.name === 'Beginner Armor' && e.type === 'armor') || null,
            accessory: ALL_EQUIPMENT.find(e => e.name === "Traveler's Pendant" && e.type === 'accessory') || null
          },
          titles: ['Novice Adventurer'],
          appearance: formData.appearance,
          inventory: [],
          appliedTitle: null
        }
        
        await userActions.setCharacter(newCharacter)
        
        // Add starter quests
        await userActions.addQuest({
          name: 'Complete your first task',
          reward: 50,
          category: 'Education',
          completed: false,
          accepted: false
        })
        
        await userActions.addQuest({
          name: 'Read for 30 minutes',
          reward: 25,
          category: 'Education',
          completed: false,
          accepted: false
        })
        
        // Redirect to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Registration failed:', error)
        // You might want to show an error message to the user here
      }
    }
  }
  
  // Helper to get race-specific default weapon
  const getRaceDefaultWeapon = (race: Race): string => {
    switch (race) {
      case 'human': return 'Balanced Sword'
      case 'elf': return 'Elven Bow'
      case 'dwarf': return 'Dwarven Axe'
      case 'orc': return 'Orcish Cleaver'
      case 'kitsune': return 'Magic Staff'
      default: return 'Basic Sword'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark flex items-center justify-center px-4 py-12">
      <motion.div 
        className="w-full max-w-lg bg-white dark:bg-dark rounded-xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8">
          <h2 className="text-3xl font-display text-primary-600 dark:text-primary-400 mb-6 text-center">
            {step === 1 ? 'Create Your Account' : 
             step === 2 ? 'Create Your Character' : 
             'Customize Your Appearance'}
          </h2>
          
          <div className="mb-6 flex justify-between">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className={`w-1/4 h-2 rounded-full ${
                  i <= step ? 'bg-accent-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input w-full"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input w-full"
                    placeholder="Create a strong password"
                    minLength={8}
                  />
                </div>
                
                <div>
                  <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="input w-full"
                    placeholder="Your public username"
                  />
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="characterName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Character Name
                  </label>
                  <input
                    type="text"
                    id="characterName"
                    name="characterName"
                    value={formData.characterName}
                    onChange={handleChange}
                    required
                    className="input w-full"
                    placeholder="Your hero's name"
                  />
                </div>
                
                <div>
                  <label htmlFor="race" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Race
                  </label>
                  <select
                    id="race"
                    name="race"
                    value={formData.race}
                    onChange={handleChange as any}
                    required
                    className="input w-full"
                  >
                    <option value="">Select Race</option>
                    <option value="human">Human</option>
                    <option value="elf">Elf</option>
                    <option value="dwarf">Dwarf</option>
                    <option value="orc">Orc</option>
                    <option value="kitsune">Kitsune</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="gender" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange as any}
                    required
                    className="input w-full"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-Binary</option>
                  </select>
                </div>
                
                {formData.race && (
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Race Bonus Stats:</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {formData.race === 'human' && (
                        <>
                          <div className="text-accent-600 dark:text-accent-400">+4 Wisdom</div>
                          <div className="text-primary-600 dark:text-primary-400">+4 Charisma</div>
                        </>
                      )}
                      {formData.race === 'elf' && (
                        <>
                          <div className="text-accent-600 dark:text-accent-400">+4 Intelligence</div>
                          <div className="text-primary-600 dark:text-primary-400">+2 Dexterity</div>
                        </>
                      )}
                      {formData.race === 'dwarf' && (
                        <>
                          <div className="text-accent-600 dark:text-accent-400">+4 Constitution</div>
                          <div className="text-primary-600 dark:text-primary-400">+2 Strength</div>
                        </>
                      )}
                      {formData.race === 'orc' && (
                        <>
                          <div className="text-accent-600 dark:text-accent-400">+4 Strength</div>
                          <div className="text-primary-600 dark:text-primary-400">+2 Constitution</div>
                        </>
                      )}
                      {formData.race === 'kitsune' && (
                        <>
                          <div className="text-accent-600 dark:text-accent-400">+4 Dexterity</div>
                          <div className="text-primary-600 dark:text-primary-400">+2 Intelligence</div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="appearance.hairColor" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hair Color
                    </label>
                    <input
                      type="color"
                      id="appearance.hairColor"
                      name="appearance.hairColor"
                      value={formData.appearance.hairColor}
                      onChange={handleChange}
                      className="w-full h-10 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="appearance.hairStyle" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hair Style
                    </label>
                    <select
                      id="appearance.hairStyle"
                      name="appearance.hairStyle"
                      value={formData.appearance.hairStyle}
                      onChange={handleChange as any}
                      className="input w-full"
                    >
                      <option value="0">Style 1</option>
                      <option value="1">Style 2</option>
                      <option value="2">Style 3</option>
                      <option value="3">Style 4</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="appearance.eyeColor" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Eye Color
                    </label>
                    <input
                      type="color"
                      id="appearance.eyeColor"
                      name="appearance.eyeColor"
                      value={formData.appearance.eyeColor}
                      onChange={handleChange}
                      className="w-full h-10 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="appearance.skinTone" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Skin Tone
                    </label>
                    <input
                      type="color"
                      id="appearance.skinTone"
                      name="appearance.skinTone"
                      value={formData.appearance.skinTone}
                      onChange={handleChange}
                      className="w-full h-10 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                  {formData.race ? (
                    <div className="relative w-32 h-32 mx-auto overflow-hidden">
                      <Image 
                        src={`/images/fire-emblem/character-${formData.race}.png`}
                        alt="Character Preview"
                        width={128}
                        height={128}
                        className="object-cover"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3))`
                        }}
                      ></div>
                      <p className="text-sm mt-4 text-gray-500 dark:text-gray-400">
                        {formData.characterName || 'Your Character'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select a race to see character preview
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="btn btn-secondary"
                >
                  Back
                </button>
              ) : (
                <Link href="/" className="btn btn-secondary">
                  Cancel
                </Link>
              )}
              
              <button type="submit" className="btn btn-primary">
                {step < 3 ? 'Next' : 'Create Character'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
} 