import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { QuestCategory } from '@/store/userStore'

interface AddQuestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (quest: {
    name: string
    category: QuestCategory
    description: string
    reward: number
    goldReward: number
    itemReward: string
  }) => void
  initialQuestName?: string
}

export default function AddQuestModal({ isOpen, onClose, onSubmit, initialQuestName = '' }: AddQuestModalProps) {
  const [quest, setQuest] = useState({
    name: initialQuestName,
    category: 'Wellness' as QuestCategory,
    description: '',
    reward: 30,
    goldReward: 0,
    itemReward: ''
  })

  // Reset form when modal opens with new initial quest name
  useEffect(() => {
    if (isOpen) {
      setQuest(prev => ({
        ...prev,
        name: initialQuestName
      }))
    }
  }, [isOpen, initialQuestName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(quest)
    setQuest({
      name: '',
      category: 'Wellness',
      description: '',
      reward: 30,
      goldReward: 0,
      itemReward: ''
    })
  }

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800/95 p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-medium text-white mb-4">
                  Add Custom Quest
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      Quest Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={quest.name}
                      onChange={(e) => setQuest({ ...quest, name: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      id="category"
                      value={quest.category}
                      onChange={(e) => setQuest({ ...quest, category: e.target.value as QuestCategory })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="Wellness">Wellness</option>
                      <option value="Education">Education</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Health">Health</option>
                      <option value="Skills">Skills</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={quest.description}
                      onChange={(e) => setQuest({ ...quest, description: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reward" className="block text-sm font-medium text-gray-300 mb-1">
                        XP Reward
                      </label>
                      <input
                        type="number"
                        id="reward"
                        value={quest.reward}
                        onChange={(e) => setQuest({ ...quest, reward: parseInt(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="goldReward" className="block text-sm font-medium text-gray-300 mb-1">
                        Gold Reward
                      </label>
                      <input
                        type="number"
                        id="goldReward"
                        value={quest.goldReward}
                        onChange={(e) => setQuest({ ...quest, goldReward: parseInt(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="itemReward" className="block text-sm font-medium text-gray-300 mb-1">
                      Item Reward (Optional)
                    </label>
                    <input
                      type="text"
                      id="itemReward"
                      value={quest.itemReward}
                      onChange={(e) => setQuest({ ...quest, itemReward: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter item name or leave empty"
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Create Quest
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 