import { Quest, QuestPrerequisite, Character } from '@/store/userStore'

export const isQuestLocked = (quest: Quest, character: Character): boolean => {
  if (!quest.levelRequirement && !quest.prerequisites) return false
  
  // Check level requirement
  if (quest.levelRequirement && character.level < quest.levelRequirement) {
    return true
  }
  
  // Check prerequisites
  if (quest.prerequisites) {
    return quest.prerequisites.some(prereq => {
      switch (prereq.type) {
        case 'level':
          return character.level < (prereq.requiredLevel || 0)
        case 'skill':
          return !character.skills[prereq.requiredSkill || ''] || 
                 character.skills[prereq.requiredSkill || ''] < (prereq.value as number)
        case 'quest':
          return !character.completedQuests?.includes(prereq.requiredQuestId || '')
        default:
          return false
      }
    })
  }
  
  return false
}

export const isQuestExpired = (quest: Quest): boolean => {
  if (!quest.expirationDate) return false
  return new Date() > new Date(quest.expirationDate)
}

export const getQuestStatus = (quest: Quest, character: Character): 'available' | 'locked' | 'expired' | 'completed' => {
  if (quest.completed) return 'completed'
  if (isQuestExpired(quest)) return 'expired'
  if (isQuestLocked(quest, character)) return 'locked'
  return 'available'
}

export const formatExpirationDate = (date: Date): string => {
  const now = new Date()
  const expiration = new Date(date)
  const diffTime = expiration.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Expires today'
  if (diffDays === 1) return 'Expires tomorrow'
  if (diffDays < 7) return `Expires in ${diffDays} days`
  return `Expires ${expiration.toLocaleDateString()}`
}

export const getQuestIcon = (quest: Quest, character: Character): string => {
  if (isQuestLocked(quest, character)) {
    return '/images/fire-emblem/quest-locked.png'
  }
  return '/images/fire-emblem/quest-1.png'
} 