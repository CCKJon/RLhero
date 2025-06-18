import { createCollectionStore } from './collectionStore'
import { DocumentData } from 'firebase/firestore'

export interface Quest extends DocumentData {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  xpReward: number
  goldReward: number
  requirements: {
    level?: number
    items?: string[]
    quests?: string[]
  }
  isRepeatable: boolean
  cooldown?: number // in hours
  createdAt: string
  updatedAt: string
}

// Transform function to ensure proper typing
const transformQuest = (doc: DocumentData & { id: string }): Quest => ({
  id: doc.id,
  title: doc.title,
  description: doc.description,
  difficulty: doc.difficulty,
  xpReward: doc.xpReward,
  goldReward: doc.goldReward,
  requirements: doc.requirements || {},
  isRepeatable: doc.isRepeatable || false,
  cooldown: doc.cooldown,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
})

// Create the quest store
export const useQuestStore = createCollectionStore<Quest>('quests', transformQuest)

// Example usage:
/*
// Create a new quest
const createQuest = async () => {
  const questData = {
    title: 'Daily Exercise',
    description: 'Complete 30 minutes of exercise',
    difficulty: 'easy' as const,
    xpReward: 100,
    goldReward: 50,
    requirements: {},
    isRepeatable: true,
    cooldown: 24,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  const questId = await useQuestStore.getState().create(questData)
}

// Subscribe to all quests
useQuestStore.getState().subscribeToCollection()

// Subscribe to a specific quest
useQuestStore.getState().subscribeToDocument('quest-id')

// Query quests by difficulty
const easyQuests = await useQuestStore.getState().query([
  where('difficulty', '==', 'easy')
])

// Update a quest
await useQuestStore.getState().update('quest-id', {
  xpReward: 150
})

// Delete a quest
await useQuestStore.getState().delete('quest-id')
*/ 