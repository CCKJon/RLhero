import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Image from 'next/image'
import { FaGift, FaScroll, FaStore, FaClock } from 'react-icons/fa'

interface Event {
  id: string;
  title: string;
  description: string;
  endDate: string;
  type: 'event' | 'item' | 'quest' | 'reward';
  imageUrl: string;
  accepted?: boolean;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onAccept: (eventId: string) => void;
  isAccepted?: boolean;
}

const getIcon = (type: Event['type']) => {
  switch (type) {
    case 'event':
      return <FaClock className="text-primary-400" />;
    case 'item':
      return <FaStore className="text-accent-400" />;
    case 'quest':
      return <FaScroll className="text-secondary-400" />;
    case 'reward':
      return <FaGift className="text-accent-500" />;
  }
};

export default function EventModal({ isOpen, onClose, event, onAccept, isAccepted }: EventModalProps) {
  if (!event) return null;

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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-dark/90 p-6 text-left align-middle shadow-xl transition-all border border-gray-800">
                <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark/80" />
                  <div className="absolute top-4 right-4">
                    {getIcon(event.type)}
                  </div>
                </div>

                <Dialog.Title as="h3" className="text-2xl font-display text-white mb-4">
                  {event.title}
                </Dialog.Title>

                <div className="space-y-4">
                  <p className="text-gray-300">{event.description}</p>

                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Event Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Type</span>
                        <span className="text-white capitalize">{event.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">End Date</span>
                        <span className="text-white">
                          {new Date(event.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Status</span>
                        <span className={`${isAccepted ? 'text-green-400' : 'text-yellow-400'}`}>
                          {isAccepted ? 'Accepted' : 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={onClose}
                    >
                      Close
                    </button>
                    {!isAccepted && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => onAccept(event.id)}
                      >
                        Accept Event
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
  );
} 