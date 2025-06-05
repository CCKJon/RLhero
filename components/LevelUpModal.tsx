import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  rewards: {
    gold: number;
    items: Array<{
      name: string;
      type: string;
      image: string;
    }>;
  };
}

export default function LevelUpModal({ isOpen, onClose, newLevel, rewards }: LevelUpModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 relative"
        >
          <div className="text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-primary-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl font-bold text-white">↑</span>
              </div>
              <h2 className="text-2xl font-display text-white mb-2">Level Up!</h2>
              <p className="text-gray-400">Congratulations! You've reached level {newLevel}</p>
            </div>

            <div className="space-y-6">
              {/* Rewards Section */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">Rewards</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Image 
                        src="/images/fire-emblem/gold-coin.png" 
                        alt="Gold" 
                        width={24} 
                        height={24}
                        className="mr-2"
                      />
                      <span className="text-yellow-400">{rewards.gold} Gold</span>
                    </div>
                  </div>
                  {rewards.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          width={24} 
                          height={24}
                          className="mr-2"
                        />
                        <span className="text-white">{item.name}</span>
                      </div>
                      <span className="text-sm text-gray-400">{item.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Features Section */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">New Features Unlocked</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• New quests available</li>
                  <li>• New items in the shop</li>
                  <li>• New skills to learn</li>
                </ul>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 