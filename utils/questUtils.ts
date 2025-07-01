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

export const getQuestIcon = (quest: Quest, character: Character): string => {
  if (isQuestLocked(quest, character)) {
    return '/images/fire-emblem/quest-locked.png'
  }
  return '/images/fire-emblem/quest-1.png'
} 