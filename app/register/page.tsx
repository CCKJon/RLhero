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
import CharacterCustomizer from '../components/CharacterCustomizer'

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
      skinTone: [] as Array<{ original: string; replacement: string }>,
      hairColor: [] as Array<{ original: string; replacement: string }>,
      eyeColor: [] as Array<{ original: string; replacement: string }>,
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
          gold: 0,
          sp: 0,
          stats: {
            strength: formData.race === 'orc' ? 12 : formData.race === 'dwarf' ? 10 : 8,
            intelligence: formData.race === 'elf' ? 12 : formData.race === 'kitsune' ? 10 : 8,
            dexterity: formData.race === 'kitsune' ? 12 : formData.race === 'elf' ? 10 : 8,
            wisdom: formData.race === 'human' ? 10 : 8,
            constitution: formData.race === 'dwarf' ? 12 : formData.race === 'orc' ? 10 : 8,
            charisma: formData.race === 'human' ? 12 : 8
          },
          skills: {},
          equipment: {
            helm: null,
            top: null,
            bottom: null,
            shoes: null,
            gloves: null,
            pendant: null,
            consumable: null,
            weapon: ALL_EQUIPMENT.find(e => e.name === getRaceDefaultWeapon(formData.race) && e.type === 'weapon') || ALL_EQUIPMENT.find(e => e.type === 'weapon')!,
            secondary: null
          },
          titles: ['Novice Adventurer'],
          appearance: formData.appearance,
          inventory: [
            ALL_EQUIPMENT.find(e => e.name === 'Beginner Armor' && e.type === 'top'),
            ALL_EQUIPMENT.find(e => e.name === "Traveler's Pendant" && e.type === 'pendant')
          ].filter(Boolean) as typeof ALL_EQUIPMENT,
          appliedTitle: null,
          class: 'warrior',
          completedQuests: []
        }
        
        await userActions.setCharacter(newCharacter)
        
        // Add starter quests
        await userActions.addQuest({
          name: 'Complete your first task',
          reward: 50,
          category: 'Education',
          completed: false,
          accepted: false,
          goldReward: 100
        })
        
        await userActions.addQuest({
          name: 'Read for 30 minutes',
          reward: 25,
          category: 'Education',
          completed: false,
          accepted: false,
          description: 'Read any book or article for 30 minutes to improve your knowledge.',
          difficulty: 1,
          goldReward: 50
        })

        await userActions.addQuest({
          name: 'Advanced Study Session',
          reward: 50,
          category: 'Education',
          completed: false,
          accepted: false,
          description: 'Complete a 2-hour focused study session on a challenging topic.',
          difficulty: 3,
          levelRequirement: 5,
          goldReward: 150,
          prerequisites: [
            {
              type: 'quest',
              value: 'Read for 30 minutes',
              requiredQuestId: 'read-30-min'
            }
          ]
        })

        await userActions.addQuest({
          name: 'Master the Basics',
          reward: 40,
          category: 'Skills',
          completed: false,
          accepted: false,
          description: 'Practice a new skill for 1 hour to master the fundamentals.',
          difficulty: 2,
          levelRequirement: 3,
          goldReward: 75
        })

        await userActions.addQuest({
          name: 'Skill Mastery',
          reward: 75,
          category: 'Skills',
          completed: false,
          accepted: false,
          description: 'Achieve level 5 in any skill to demonstrate mastery.',
          difficulty: 4,
          levelRequirement: 8,
          goldReward: 200,
          prerequisites: [
            {
              type: 'skill',
              value: 5,
              requiredSkill: 'any'
            }
          ]
        })

        await userActions.addQuest({
          name: 'Daily Exercise',
          reward: 30,
          category: 'Fitness',
          completed: false,
          accepted: false,
          description: 'Complete a 30-minute workout session.',
          difficulty: 2,
          goldReward: 50
        })

        await userActions.addQuest({
          name: 'Fitness Challenge',
          reward: 60,
          category: 'Fitness',
          completed: false,
          accepted: false,
          description: 'Complete a 1-hour high-intensity workout.',
          difficulty: 3,
          levelRequirement: 4,
          goldReward: 150,
          prerequisites: [
            {
              type: 'quest',
              value: 'Daily Exercise',
              requiredQuestId: 'daily-exercise'
            }
          ]
        })

        await userActions.addQuest({
          name: 'Walk 10,000 steps',
          reward: 35,
          category: 'Fitness',
          completed: false,
          accepted: false,
          description: 'Track and complete 10,000 steps in a day.',
          difficulty: 2,
          levelRequirement: 2,
          goldReward: 75
        })

        await userActions.addQuest({
          name: 'Cook a healthy meal',
          reward: 20,
          category: 'Wellness',
          completed: false,
          accepted: false,
          description: 'Prepare and eat a healthy meal.',
          difficulty: 1,
          goldReward: 50
        })

        await userActions.addQuest({
          name: 'Complete a group workout',
          reward: 70,
          category: 'Fitness',
          completed: false,
          accepted: false,
          description: 'Join a group workout session and complete it together.',
          difficulty: 4,
          levelRequirement: 6,
          goldReward: 200,
          prerequisites: [
            {
              type: 'quest',
              value: 'Daily Exercise',
              requiredQuestId: 'daily-exercise'
            }
          ]
        })

        await userActions.addQuest({
          name: 'Write a journal entry',
          reward: 15,
          category: 'Wellness',
          completed: false,
          accepted: false,
          description: 'Reflect on your day and write a journal entry.',
          difficulty: 1,
          goldReward: 25
        })

        await userActions.addQuest({
          name: 'Run 5km',
          reward: 55,
          category: 'Fitness',
          completed: false,
          accepted: false,
          description: 'Go for a 5km run.',
          difficulty: 3,
          levelRequirement: 4,
          goldReward: 125
        })

        await userActions.addQuest({
          name: 'Learn a new language word',
          reward: 10,
          category: 'Education',
          completed: false,
          accepted: false,
          description: 'Learn and use a new word in a foreign language.',
          difficulty: 1
        })

        await userActions.addQuest({
          name: 'Complete a meditation session',
          reward: 25,
          category: 'Health',
          completed: false,
          accepted: false,
          description: 'Meditate for at least 15 minutes.',
          difficulty: 2,
          levelRequirement: 2
        })

        await userActions.addQuest({
          name: 'Win a party challenge',
          reward: 100,
          category: 'Skills',
          completed: false,
          accepted: false,
          description: 'Participate in and win a party challenge.',
          difficulty: 5,
          levelRequirement: 10,
          prerequisites: [
            {
              type: 'quest',
              value: 'Skill Mastery',
              requiredQuestId: 'skill-mastery'
            }
          ]
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
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customize Appearance
                    </label>
                    <CharacterCustomizer
                      baseImageUrl={`/images/fire-emblem/character-${formData.race}.png`}
                      onColorChange={(colorMappings) => {
                        setFormData(prev => ({
                          ...prev,
                          appearance: {
                            ...prev.appearance,
                            skinTone: colorMappings.skinTone,
                            hairColor: colorMappings.hairColor,
                            eyeColor: colorMappings.eyeColor,
                          }
                        }));
                      }}
                    />
                  </div>
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