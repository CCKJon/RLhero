import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { useAuthStore } from './authStore'
import { Equipment, EquipmentStats, EquipmentSlot, calculateEquipmentStats, calculateSetBonuses } from '@/types/equipment'

// Types for our character
export type Race = 'human' | 'elf' | 'dwarf' | 'orc' | 'kitsune'
export type Gender = 'male' | 'female' | 'non-binary'
export type CharacterClass = 'warrior' | 'mage' | 'archer' | 'assassin' | 'knight' | 'priest' | 'thief' | 'bard' | 'druid' | 'monk' | 'paladin' | 'ranger' | 'shaman' | 'warlock' | 'wizard'

export type Character = {
  id: string
  name: string
  race: Race
  gender: Gender
  class: CharacterClass
  level: number
  experience: number
  nextLevelXp: number
  gold: number
  sp: number
  stats: {
    strength: number
    intelligence: number
    dexterity: number
    wisdom: number
    constitution: number
    charisma: number
  }
  skills: Record<string, number>
  equipment: Record<EquipmentSlot, Equipment | null>
  inventory: Equipment[]
  titles: string[]
  appliedTitle: string | null
  appearance: {
    hairStyle: number
    hairColor: string
    eyeColor: string
    skinTone: string
  }
  completedQuests: string[]
}

// Types for our quests
export type QuestCategory = 'Wellness' | 'Education' | 'Fitness' | 'Health' | 'Skills'

export type QuestPrerequisite = {
  type: 'level' | 'skill' | 'quest'
  value: number | string
  requiredLevel?: number
  requiredSkill?: string
  requiredQuestId?: string
}

export type Quest = {
  id: string
  name: string
  reward: number
  completed: boolean
  category: QuestCategory
  dateCreated: Date
  dateCompleted?: Date
  accepted: boolean
  description?: string
  goldReward?: number
  itemReward?: string
  difficulty?: number // 1-5
  levelRequirement?: number
  prerequisites?: QuestPrerequisite[]
  isLocked?: boolean
}

// Maximum number of quests a player can have accepted at once
const MAX_ACCEPTED_QUESTS = 25

// User store types
type UserState = {
  character: Character | null
  quests: Quest[]
  isCompetitive: boolean
  partyId: string | null
  isLoading: boolean
  error: string | null
  actions: {
    setCharacter: (character: Character) => Promise<void>
    addQuest: (quest: Omit<Quest, 'id' | 'dateCreated'>) => Promise<void>
    toggleQuestComplete: (id: string) => Promise<void>
    acceptQuest: (id: string) => Promise<void>
    gainExperience: (amount: number) => Promise<void>
    levelUp: () => Promise<void>
    improveSkill: (skillName: string, amount: number) => Promise<void>
    toggleCompetitiveMode: () => Promise<void>
    setPartyId: (partyId: string | null) => Promise<void>
    loadUserData: () => Promise<void>
    clearError: () => void
    resetState: () => void
    setAppliedTitle: (title: string | null) => Promise<void>
    equipItem: (item: Equipment) => Promise<void>
    unequipItem: (slot: keyof Character['equipment']) => Promise<void>
    addToInventory: (item: Equipment) => Promise<void>
    removeFromInventory: (itemId: string) => Promise<void>
  }
}

// Calculate XP needed for next level using a common RPG formula
const calculateNextLevelXp = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Initial empty state
const initialState: Omit<UserState, 'actions'> = {
  character: null,
  quests: [],
  isCompetitive: false,
  partyId: null,
  isLoading: false,
  error: null
}

// Create the store
export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      actions: {
        setCharacter: async (character) => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            await setDoc(doc(db, 'users', user.uid), { character }, { merge: true })
            set({ character, isLoading: false })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to update character',
              isLoading: false 
            })
            throw error
          }
        },

        addQuest: async (quest) => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const newQuest = {
              ...quest,
              id: Math.random().toString(36).substring(2, 9),
              dateCreated: new Date(),
              description: quest.description || 'Complete this quest to earn rewards!',
              difficulty: quest.difficulty || 1
            }

            const userRef = doc(db, 'users', user.uid)
            const userDoc = await getDoc(userRef)
            const currentQuests = userDoc.data()?.quests || []
            
            await updateDoc(userRef, {
              quests: [...currentQuests, newQuest]
            })

            set((state) => ({ 
              quests: [...state.quests, newQuest],
              isLoading: false
            }))
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to add quest',
              isLoading: false 
            })
            throw error
          }
        },

        toggleQuestComplete: async (id) => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const state = get()
            const quest = state.quests.find(q => q.id === id)
            if (!quest) throw new Error('Quest not found')

            const updatedQuest = {
              ...quest,
              completed: !quest.completed,
              dateCompleted: !quest.completed ? new Date() : undefined
            }

            const userRef = doc(db, 'users', user.uid)
            const userDoc = await getDoc(userRef)
            const currentQuests = userDoc.data()?.quests || []
            
            await updateDoc(userRef, {
              quests: currentQuests.map((q: Quest) => 
                q.id === id ? updatedQuest : q
              )
            })

            if (!quest.completed) {
              await get().actions.gainExperience(quest.reward)
            }

            set((state) => ({
              quests: state.quests.map(q => 
                q.id === id ? updatedQuest : q
              ),
              isLoading: false
            }))
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to toggle quest',
              isLoading: false 
            })
            throw error
          }
        },

        acceptQuest: async (id) => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const state = get()
            const quest = state.quests.find(q => q.id === id)
            if (!quest) throw new Error('Quest not found')

            // Check if player has reached the quest limit
            const acceptedQuestsCount = state.quests.filter(q => q.accepted && !q.completed).length
            if (acceptedQuestsCount >= MAX_ACCEPTED_QUESTS) {
              throw new Error(`You can only have ${MAX_ACCEPTED_QUESTS} active quests at a time. Complete some quests before accepting new ones.`)
            }

            const updatedQuest = {
              ...quest,
              accepted: true
            }

            const userRef = doc(db, 'users', user.uid)
            const userDoc = await getDoc(userRef)
            const currentQuests = userDoc.data()?.quests || []
            
            await updateDoc(userRef, {
              quests: currentQuests.map((q: Quest) => 
                q.id === id ? updatedQuest : q
              )
            })

            set((state) => ({
              quests: state.quests.map(q => 
                q.id === id ? updatedQuest : q
              ),
              isLoading: false
            }))
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to accept quest',
              isLoading: false 
            })
            throw error
          }
        },

        gainExperience: async (amount) => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const state = get()
            const character = state.character
            if (!character) throw new Error('No character found')

            const newExperience = character.experience + amount
            const nextLevelXp = character.nextLevelXp

            if (newExperience >= nextLevelXp) {
              await get().actions.levelUp()
              return
            }

            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
              'character.experience': newExperience
            })

            set({
              character: {
                ...character,
                experience: newExperience
              },
              isLoading: false
            })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to gain experience',
              isLoading: false 
            })
            throw error
          }
        },

        levelUp: async () => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const state = get()
            const character = state.character
            if (!character) throw new Error('No character found')

            const newLevel = character.level + 1
            const newExperience = character.experience - character.nextLevelXp
            const newNextLevelXp = calculateNextLevelXp(newLevel)

            const statKeys = ['strength', 'intelligence', 'dexterity', 'wisdom', 'constitution', 'charisma'] as const
            const randomStatIndex = Math.floor(Math.random() * statKeys.length)
            const randomStat = statKeys[randomStatIndex]

            const updatedCharacter = {
              ...character,
              level: newLevel,
              experience: newExperience,
              nextLevelXp: newNextLevelXp,
              stats: {
                ...character.stats,
                [randomStat]: character.stats[randomStat] + 1
              }
            }

            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
              character: updatedCharacter
            })

            set({
              character: updatedCharacter,
              isLoading: false
            })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to level up',
              isLoading: false 
            })
            throw error
          }
        },

        improveSkill: async (skillName, amount) => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const state = get()
            const character = state.character
            if (!character) throw new Error('No character found')

            let skills = { ...character.skills }
            let skill = skills[skillName]

            if (skill) {
              const newProgress = skill + amount
              
              if (newProgress >= 100) {
                skill = newProgress - 100
                await get().actions.gainExperience(skill * 10)
              }
            } else {
              skills[skillName] = amount
            }

            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
              'character.skills': skills
            })

            set({
              character: {
                ...character,
                skills
              },
              isLoading: false
            })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to improve skill',
              isLoading: false 
            })
            throw error
          }
        },

        toggleCompetitiveMode: async () => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const state = get()
            const newMode = !state.isCompetitive

            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
              isCompetitive: newMode
            })

            set({
              isCompetitive: newMode,
              isLoading: false
            })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to toggle competitive mode',
              isLoading: false 
            })
            throw error
          }
        },

        setPartyId: async (partyId) => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
              partyId
            })

            set({
              partyId,
              isLoading: false
            })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to set party ID',
              isLoading: false 
            })
            throw error
          }
        },

        loadUserData: async () => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const userRef = doc(db, 'users', user.uid)
            const userDoc = await getDoc(userRef)
            
            if (!userDoc.exists()) {
              throw new Error('User data not found')
            }

            const userData = userDoc.data()
            const character = userData.character ? {
              ...userData.character,
              inventory: userData.character.inventory || []
            } : null

            set({
              character,
              quests: userData.quests || [],
              isCompetitive: userData.isCompetitive || false,
              partyId: userData.partyId || null,
              isLoading: false
            })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to load user data',
              isLoading: false 
            })
            throw error
          }
        },

        clearError: () => set({ error: null }),

        resetState: () => {
          set(initialState)
        },

        setAppliedTitle: async (title) => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const state = get()
            const character = state.character
            if (!character) throw new Error('No character found')

            // Verify the title exists in the character's titles
            if (title && !character.titles.includes(title)) {
              throw new Error('Title not found in character titles')
            }

            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
              'character.appliedTitle': title
            })

            set({
              character: {
                ...character,
                appliedTitle: title
              },
              isLoading: false
            })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to set applied title',
              isLoading: false 
            })
            throw error
          }
        },

        equipItem: async (item: Equipment) => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const state = get()
            const character = state.character
            if (!character) throw new Error('No character found')

            // Only allow equipping weapon, armor, or accessory
            if (item.type === 'consumable') {
              throw new Error('Consumable items cannot be equipped')
            }

            // Remove item from inventory
            const updatedInventory = character.inventory.filter(i => i.id !== item.id)
            
            // Get currently equipped item in that slot
            const currentItem = character.equipment[item.type]
            
            // Add current item back to inventory if it exists
            if (currentItem) {
              updatedInventory.push(currentItem)
            }

            // Update equipment
            const updatedEquipment = {
              ...character.equipment,
              [item.type]: item
            }

            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
              'character.equipment': updatedEquipment,
              'character.inventory': updatedInventory
            })

            set({
              character: {
                ...character,
                equipment: updatedEquipment,
                inventory: updatedInventory
              },
              isLoading: false
            })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to equip item',
              isLoading: false 
            })
            throw error
          }
        },

        unequipItem: async (slot: keyof Character['equipment']) => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const state = get()
            const character = state.character
            if (!character) throw new Error('No character found')

            const item = character.equipment[slot]
            if (!item) throw new Error('No item equipped in that slot')

            // Add item to inventory
            const updatedInventory = [...character.inventory, item]
            
            // Remove item from equipment
            const updatedEquipment = {
              ...character.equipment,
              [slot]: null
            }

            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
              'character.equipment': updatedEquipment,
              'character.inventory': updatedInventory
            })

            set({
              character: {
                ...character,
                equipment: updatedEquipment,
                inventory: updatedInventory
              },
              isLoading: false
            })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to unequip item',
              isLoading: false 
            })
            throw error
          }
        },

        addToInventory: async (item: Equipment) => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const state = get()
            const character = state.character
            if (!character) throw new Error('No character found')

            const updatedInventory = [...character.inventory, item]

            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
              'character.inventory': updatedInventory
            })

            set({
              character: {
                ...character,
                inventory: updatedInventory
              },
              isLoading: false
            })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to add item to inventory',
              isLoading: false 
            })
            throw error
          }
        },

        removeFromInventory: async (itemId: string) => {
          try {
            set({ isLoading: true, error: null })
            const { user } = useAuthStore.getState()
            if (!user) throw new Error('No authenticated user')

            const state = get()
            const character = state.character
            if (!character) throw new Error('No character found')

            const updatedInventory = character.inventory.filter(item => item.id !== itemId)

            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
              'character.inventory': updatedInventory
            })

            set({
              character: {
                ...character,
                inventory: updatedInventory
              },
              isLoading: false
            })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to remove item from inventory',
              isLoading: false 
            })
            throw error
          }
        }
      }
    })
  )
)

// Initialize user data when auth state changes
if (typeof window !== 'undefined') {
  useAuthStore.subscribe((state) => {
    if (state.user) {
      useUserStore.getState().actions.loadUserData()
    } else {
      useUserStore.setState(initialState)
    }
  })
} 