import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Quest, QuestPrerequisite, getMaxAcceptedQuests } from '@/store/userStore'
import { useUserStore } from '@/store/userStore'

interface QuestModalProps {
  isOpen: boolean
  onClose: () => void
  quest: Quest | null
  onAccept: (quest: Quest) => void
}

export default function QuestModal({ isOpen, onClose, quest, onAccept }: QuestModalProps) {
  const { character, quests, actions: { completeQuest } } = useUserStore()
  const [error, setError] = useState<string | null>(null)
  
  if (!quest || !character) return null

  const handleAccept = async () => {
    try {
      setError(null)
      if (quest.completed) {
        setError('This quest has already been completed')
        return
      }
      await onAccept(quest)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleComplete = async () => {
    try {
      setError(null)
      if (quest.completed) {
        setError('This quest has already been completed')
        return
      }
      await completeQuest(quest.id)
      onClose()
    } catch (error: any) {
      setError(error.message)
    }
  }

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
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md sm:max-w-lg transform overflow-hidden rounded-2xl bg-gray-800/95 p-4 sm:p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg sm:text-xl font-medium text-white mb-4 break-words">
                  {quest.name}
                </Dialog.Title>

                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-900/50 text-red-200 px-4 py-2 rounded break-words">
                      {error}
                    </div>
                  )}

                  <p className="text-gray-400 break-words">{quest.description}</p>

                  {quest.levelRequirement && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 mr-2">Level Requirement:</span>
                      <span className={locked ? 'text-red-400' : 'text-green-400'}>
                        {quest.levelRequirement}
                      </span>
                    </div>
                  )}

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

                  {/* Quest Count Display */}
                  {!quest.accepted && (
                    <div className="mt-4 px-4 py-2 bg-dark/50 backdrop-blur-sm rounded-lg border border-gray-700">
                      <p className="text-sm font-medium text-gray-300">Accepted Quests</p>
                      <p className="text-2xl font-bold text-white">
                        {quests.filter((q: Quest) => q.accepted && !q.completed).length}/{getMaxAcceptedQuests(character.level)}
                      </p>
                    </div>
                  )}

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
                        onClick={handleAccept}
                      >
                        Accept Quest
                      </button>
                    )}
                    {quest.accepted && !quest.completed && (
                      <button
                        type="button"
                        className="btn btn-accent"
                        onClick={handleComplete}
                      >
                        Complete Quest
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 