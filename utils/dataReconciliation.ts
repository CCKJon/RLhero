import { Character, Race, Gender, CharacterClass } from '@/store/userStore'
import { EquipmentSlot, Equipment } from '@/types/equipment'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Default values for new character attributes
const DEFAULT_CHARACTER: Character = {
  id: '',
  name: '',
  race: 'human' as Race,
  gender: 'male' as Gender,
  class: 'warrior' as CharacterClass,
  level: 1,
  experience: 0,
  nextLevelXp: 100,
  gold: 0,
  sp: 0,
  stats: {
    strength: 10,
    intelligence: 10,
    dexterity: 10,
    wisdom: 10,
    constitution: 10,
    charisma: 10
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
    weapon: null,
    secondary: null,
    accessory: null
  },
  inventory: [],
  titles: [],
  appliedTitle: null,
  appearance: {
    hairStyle: 1,
    skinTone: [],
    hairColor: [],
    eyeColor: []
  },
  completedQuests: []
}

type UserData = {
  character?: Partial<Character>
  quests?: any[]
  isCompetitive?: boolean
  partyId?: string | null
  [key: string]: any
}

/**
 * Reconciles user data with the current schema, adding any missing fields with default values
 * @param userId The user's Firebase UID
 * @param currentData The current user data from Firestore
 * @returns Promise<void>
 */
export async function reconcileUserData(userId: string, currentData: UserData): Promise<void> {
  try {
    const updates: Record<string, any> = {}
    let hasUpdates = false

    // Check and update character data
    if (currentData.character) {
      const characterUpdates: any = {}
      
      // Check each field in the character schema
      for (const [key, defaultValue] of Object.entries(DEFAULT_CHARACTER)) {
        const typedKey = key as keyof Character
        if (currentData.character[typedKey] === undefined) {
          characterUpdates[typedKey] = defaultValue
          hasUpdates = true
        }
      }

      // Special handling for nested objects
      if (currentData.character.stats) {
        const statsUpdates: Partial<typeof DEFAULT_CHARACTER.stats> = {}
        for (const [statKey, defaultValue] of Object.entries(DEFAULT_CHARACTER.stats)) {
          const typedKey = statKey as keyof typeof DEFAULT_CHARACTER.stats
          if (currentData.character.stats[typedKey] === undefined) {
            statsUpdates[typedKey] = defaultValue
            hasUpdates = true
          }
        }
        if (Object.keys(statsUpdates).length > 0) {
          characterUpdates.stats = {
            ...currentData.character.stats,
            ...statsUpdates
          }
        }
      }

      if (currentData.character.equipment) {
        const equipmentUpdates: Partial<Record<EquipmentSlot, Equipment | null>> = {}
        for (const [slotKey, defaultValue] of Object.entries(DEFAULT_CHARACTER.equipment)) {
          const typedKey = slotKey as EquipmentSlot
          if (currentData.character.equipment[typedKey] === undefined) {
            equipmentUpdates[typedKey] = defaultValue
            hasUpdates = true
          }
        }
        if (Object.keys(equipmentUpdates).length > 0) {
          characterUpdates.equipment = {
            ...currentData.character.equipment,
            ...equipmentUpdates
          }
        }
      }

      if (currentData.character.appearance) {
        const appearanceUpdates: any = {}
        for (const [appearanceKey, defaultValue] of Object.entries(DEFAULT_CHARACTER.appearance)) {
          const typedKey = appearanceKey as keyof typeof DEFAULT_CHARACTER.appearance
          if (currentData.character.appearance[typedKey] === undefined) {
            appearanceUpdates[typedKey] = defaultValue
            hasUpdates = true
          }
        }
        if (Object.keys(appearanceUpdates).length > 0) {
          characterUpdates.appearance = {
            ...currentData.character.appearance,
            ...appearanceUpdates
          }
        }
      }

      if (Object.keys(characterUpdates).length > 0) {
        updates.character = {
          ...currentData.character,
          ...characterUpdates
        }
      }
    } else {
      // If no character exists, create a new one with default values
      updates.character = {
        ...DEFAULT_CHARACTER,
        id: userId
      }
      hasUpdates = true
    }

    // Check and update other user data fields
    if (currentData.quests === undefined) {
      updates.quests = []
      hasUpdates = true
    }

    if (currentData.isCompetitive === undefined) {
      updates.isCompetitive = false
      hasUpdates = true
    }

    if (currentData.partyId === undefined) {
      updates.partyId = null
      hasUpdates = true
    }

    // Only update if there are changes
    if (hasUpdates) {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, updates)
    }
  } catch (error) {
    console.error('Error reconciling user data:', error)
    throw error
  }
} 