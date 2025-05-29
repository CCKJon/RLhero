import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Quest, QuestPrerequisite } from '@/store/userStore'
import { useUserStore } from '@/store/userStore'

type QuestModalProps = {
  isOpen: boolean
  onClose: () => void
  quest: Quest | null
  onAccept?: () => void
}

export default function QuestModal({ isOpen, onClose, quest, onAccept }: QuestModalProps) {
  const { character } = useUserStore()
  
  if (!quest || !character) return null

  const isQuestLocked = () => {
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

  const getPrerequisiteText = (prereq: QuestPrerequisite) => {
    switch (prereq.type) {
      case 'level':
        return `Level ${prereq.requiredLevel}`
      case 'skill':
        return `${prereq.requiredSkill} Level ${prereq.value}`
      case 'quest':
        return `Complete Quest: ${prereq.value}`
      default:
        return ''
    }
  }

  const locked = isQuestLocked()

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white"
                >
                  {quest.name}
                  {locked && (
                    <span className="ml-2 text-sm text-red-400">(Locked)</span>
                  )}
                </Dialog.Title>

                <div className="mt-2 flex items-center text-sm text-gray-300">
                  <span className="w-24">Difficulty:</span>
                  <span className="text-yellow-400">{'★'.repeat(quest.difficulty || 1)}{'☆'.repeat(5 - (quest.difficulty || 1))}</span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-300">
                    <span className="w-24">Category:</span>
                    <span className="text-accent-400">{quest.category}</span>
                  </div>
                  
                  {quest.levelRequirement && (
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="w-24">Level Required:</span>
                      <span className={character.level >= quest.levelRequirement ? "text-green-400" : "text-red-400"}>
                        {quest.levelRequirement} (Your Level: {character.level})
                      </span>
                    </div>
                  )}
                </div>

                {quest.prerequisites && quest.prerequisites.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-primary-400 mb-1">Prerequisites</h4>
                    <div className="space-y-1 bg-gray-900/40 rounded px-3 py-2">
                      {quest.prerequisites.map((prereq, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-300">
                          <span className="w-24">Required:</span>
                          <span className={isQuestLocked() ? "text-red-400" : "text-green-400"}>
                            {getPrerequisiteText(prereq)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 mb-2">
                  <h4 className="text-sm font-semibold text-primary-400 mb-1">Description</h4>
                  <p className="text-sm text-gray-300 bg-gray-900/40 rounded px-3 py-2">
                    {quest.description || 'Complete this quest to earn rewards!'}
                  </p>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-primary-400 mb-1">Rewards</h4>
                  <div className="flex flex-col gap-1 bg-gray-900/40 rounded px-3 py-2">
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="w-24">XP:</span>
                      <span className="text-primary-400">+{quest.reward} XP</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="w-24">Gold:</span>
                      <span className="text-yellow-400">+{quest.goldReward || 0} Gold</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="w-24">Item:</span>
                      <span className="text-accent-400">{quest.itemReward || 'None'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    Close
                  </button>
                  {!locked && !quest.accepted && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={onAccept}
                    >
                      Accept Quest
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 