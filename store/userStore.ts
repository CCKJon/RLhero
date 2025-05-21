import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Types for our character
export type Race = 'human' | 'elf' | 'dwarf' | 'orc' | 'kitsune'
export type Gender = 'male' | 'female' | 'non-binary'

export type Character = {
  id: string
  name: string
  race: Race
  gender: Gender
  level: number
  experience: number
  nextLevelXp: number
  stats: {
    strength: number
    intelligence: number
    dexterity: number
    wisdom: number
    constitution: number
    charisma: number
  }
  skills: {
    name: string
    level: number
    progress: number
  }[]
  equipment: {
    weapon: string
    armor: string
    accessory: string
  }
  titles: string[]
  appearance: {
    hairStyle: number
    hairColor: string
    eyeColor: string
    skinTone: string
  }
}

// Types for our quests
export type QuestCategory = 'Wellness' | 'Education' | 'Fitness' | 'Health' | 'Skills'

export type Quest = {
  id: string
  name: string
  reward: number
  completed: boolean
  category: QuestCategory
  dateCreated: Date
  dateCompleted?: Date
}

// User store types
type UserState = {
  user: {
    id: string
    email: string
    username: string
  } | null
  character: Character | null
  quests: Quest[]
  isCompetitive: boolean
  partyId: string | null
  actions: {
    setUser: (user: UserState['user']) => void
    setCharacter: (character: Character) => void
    addQuest: (quest: Omit<Quest, 'id' | 'dateCreated'>) => void
    toggleQuestComplete: (id: string) => void
    gainExperience: (amount: number) => void
    levelUp: () => void
    improveSkill: (skillName: string, amount: number) => void
    toggleCompetitiveMode: () => void
    setPartyId: (partyId: string | null) => void
    resetState: () => void
  }
}

// Calculate XP needed for next level using a common RPG formula
const calculateNextLevelXp = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Initial empty state
const initialState: Omit<UserState, 'actions'> = {
  user: null,
  character: null,
  quests: [],
  isCompetitive: false,
  partyId: null
}

// Create the store
export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        actions: {
          setUser: (user) => set({ user }),
          
          setCharacter: (character) => set({ character }),
          
          addQuest: (quest) => set((state) => ({ 
            quests: [
              ...state.quests, 
              { 
                ...quest, 
                id: Math.random().toString(36).substring(2, 9),
                dateCreated: new Date() 
              }
            ] 
          })),
          
          toggleQuestComplete: (id) => set((state) => {
            const quest = state.quests.find(q => q.id === id)
            
            if (!quest) return state
            
            // If completing a quest, gain XP
            if (!quest.completed) {
              get().actions.gainExperience(quest.reward)
            }
            
            return {
              quests: state.quests.map(q => 
                q.id === id 
                  ? { 
                      ...q, 
                      completed: !q.completed, 
                      dateCompleted: !q.completed ? new Date() : undefined
                    } 
                  : q
              )
            }
          }),
          
          gainExperience: (amount) => set((state) => {
            const character = state.character
            
            if (!character) return state
            
            const newExperience = character.experience + amount
            const nextLevelXp = character.nextLevelXp
            
            // If experience is enough to level up
            if (newExperience >= nextLevelXp) {
              get().actions.levelUp()
              return state
            }
            
            return {
              character: {
                ...character,
                experience: newExperience
              }
            }
          }),
          
          levelUp: () => set((state) => {
            const character = state.character
            
            if (!character) return state
            
            const newLevel = character.level + 1
            const newExperience = character.experience - character.nextLevelXp
            const newNextLevelXp = calculateNextLevelXp(newLevel)
            
            // Improve stats randomly on level up
            const statKeys = ['strength', 'intelligence', 'dexterity', 'wisdom', 'constitution', 'charisma'] as const
            const randomStatIndex = Math.floor(Math.random() * statKeys.length)
            const randomStat = statKeys[randomStatIndex]
            
            return {
              character: {
                ...character,
                level: newLevel,
                experience: newExperience,
                nextLevelXp: newNextLevelXp,
                stats: {
                  ...character.stats,
                  [randomStat]: character.stats[randomStat] + 1
                }
              }
            }
          }),
          
          improveSkill: (skillName, amount) => set((state) => {
            const character = state.character
            
            if (!character) return state
            
            // Find skill or create it if doesn't exist
            let skills = [...character.skills]
            let skill = skills.find(s => s.name === skillName)
            
            if (skill) {
              // Update existing skill
              const newProgress = skill.progress + amount
              
              // Level up skill if progress >= 100
              if (newProgress >= 100) {
                skill = {
                  ...skill,
                  level: skill.level + 1,
                  progress: newProgress - 100
                }
                
                // Also gain some XP when skill levels up
                get().actions.gainExperience(skill.level * 10)
              } else {
                skill = {
                  ...skill,
                  progress: newProgress
                }
              }
              
              skills = skills.map(s => s.name === skillName ? skill! : s)
            } else {
              // Create new skill
              skills.push({
                name: skillName,
                level: 1,
                progress: amount
              })
            }
            
            return {
              character: {
                ...character,
                skills
              }
            }
          }),
          
          toggleCompetitiveMode: () => set((state) => ({
            isCompetitive: !state.isCompetitive
          })),
          
          setPartyId: (partyId) => set({ partyId }),
          
          resetState: () => set(initialState)
        }
      }),
      {
        name: 'rl-hero-storage',
        partialize: (state) => ({
          user: state.user,
          character: state.character,
          quests: state.quests,
          isCompetitive: state.isCompetitive,
          partyId: state.partyId
        })
      }
    )
  )
) 