import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Image from 'next/image'
import { Equipment, EquipmentRarity, EquipmentSlot } from '@/types/equipment'
import { useUserStore } from '@/store/userStore'

interface ItemModalProps {
  isOpen: boolean
  onClose: () => void
  item: Equipment
}

const rarityColors: Record<EquipmentRarity, string> = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400'
};

export default function ItemModal({ isOpen, onClose, item }: ItemModalProps) {
  const { character, actions } = useUserStore()

  const handleEquip = async () => {
    try {
      await actions.equipItem(item)
      onClose()
    } catch (error) {
      console.error('Failed to equip item:', error)
    }
  }

  const handleUnequip = async () => {
    try {
      await actions.unequipItem(item.type)
      onClose()
    } catch (error) {
      console.error('Failed to unequip item:', error)
    }
  }

  const isEquipped = character?.equipment[item.type]?.id === item.id

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
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className={`text-xl font-medium ${rarityColors[item.rarity]}`}>
                    {item.name}
                  </Dialog.Title>
                  <span className="text-sm text-gray-400">Level {item.level}</span>
                </div>

                <div className="w-full h-48 mb-4 flex items-center justify-center bg-gray-700/50 rounded-lg">
                  <Image 
                    src={item.image}
                    alt={item.name}
                    width={128}
                    height={128}
                    className="opacity-90"
                  />
                </div>

                <p className="text-gray-400 text-sm mb-4">{item.description}</p>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-gray-300">Stats</h4>
                  {Object.entries(item.stats).map(([stat, value]) => (
                    <div key={stat} className="flex justify-between text-sm">
                      <span className="text-gray-400 capitalize">{stat}</span>
                      <span className="text-primary-400">+{value}</span>
                    </div>
                  ))}
                </div>

                {/* Set Bonus Info */}
                {item.set && (
                  <div className="mb-4 p-3 bg-gray-700/30 rounded-lg">
                    <p className="text-sm text-gray-300 mb-2">Part of {item.set}</p>
                    <div className="text-xs text-gray-400">
                      {/* You can add set bonus description here if available */}
                    </div>
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
                  {item.type !== 'consumable' && (
                    <button
                      type="button"
                      className={`btn ${isEquipped ? 'btn-accent' : 'btn-primary'}`}
                      onClick={isEquipped ? handleUnequip : handleEquip}
                    >
                      {isEquipped ? 'Unequip' : 'Equip'}
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