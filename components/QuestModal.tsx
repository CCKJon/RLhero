import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Quest } from '@/store/userStore'

type QuestModalProps = {
  isOpen: boolean
  onClose: () => void
  quest: Quest | null
  onAccept?: () => void
}

export default function QuestModal({ isOpen, onClose, quest, onAccept }: QuestModalProps) {
  if (!quest) return null

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
                </div>

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

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                  {!quest.accepted && onAccept && (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
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