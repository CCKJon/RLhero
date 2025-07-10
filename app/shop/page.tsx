'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import Image from 'next/image';
import { Equipment, EquipmentRarity, ARMOR_SETS, ALL_EQUIPMENT } from '@/types/equipment';
import ItemModal from '@/components/ItemModal';
import CurrencyIcon from '@/components/CurrencyIcon';

const rarityColors: Record<EquipmentRarity, string> = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400'
};

export default function ShopPage() {
  const router = useRouter();
  const { character, actions } = useUserStore();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'helm' | 'top' | 'bottom' | 'shoes' | 'gloves' | 'pendant' | 'consumable' | 'weapon' | 'secondary'>('all');
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (!user) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!character) return null;

  const filteredItems = selectedCategory === 'all' 
    ? ALL_EQUIPMENT 
    : ALL_EQUIPMENT.filter(item => item.type === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl font-display text-white">Shop</h1>
            <div className="flex items-center space-x-4 sm:space-x-6 flex-wrap gap-2">
              <div className="flex items-center">
                <CurrencyIcon 
                  type="gold"
                  size={20}
                  className="mr-1"
                />
                <span className="text-yellow-400 font-bold text-sm sm:text-base">{character.gold || 0}</span>
              </div>
              <div className="flex items-center">
                <CurrencyIcon 
                  type="sp"
                  size={20}
                  className="mr-1"
                />
                <span className="text-purple-400 font-bold text-sm sm:text-base">{character.sp || 0}</span>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2">
            {['all', 'weapon', 'armor', 'accessory', 'consumable'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as any)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Shop Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors flex flex-col h-full"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className={`text-base sm:text-lg font-medium ${rarityColors[item.rarity]} truncate max-w-32 sm:max-w-40`}>{item.name}</h3>
                  <span className="text-sm text-gray-400 flex-shrink-0 ml-2">Level {item.level}</span>
                </div>
                
                <div className="w-full h-24 sm:h-32 mb-3 sm:mb-4 flex items-center justify-center bg-gray-700/50 rounded-lg">
                  <Image 
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="opacity-90 w-16 h-16 sm:w-20 sm:h-20 object-contain"
                  />
                </div>

                <p className="text-gray-400 text-sm mb-3 sm:mb-4 line-clamp-2 max-w-full">{item.description}</p>

                {/* Stats */}
                <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                  {Object.entries(item.stats).map(([stat, value]) => (
                    <div key={stat} className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-400 capitalize">{stat}</span>
                      <span className="text-primary-400">+{value}</span>
                    </div>
                  ))}
                </div>

                {/* Set Bonus Info */}
                {item.set && (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                    <p className="text-sm text-gray-300 mb-1 sm:mb-2">Part of {item.set}</p>
                    <div className="text-xs text-gray-400 line-clamp-2 max-w-full">
                      {ARMOR_SETS.find(s => s.name === item.set)?.description}
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                    }}
                    className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Purchase
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Item Modal */}
      {selectedItem && (
        <ItemModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
        />
      )}
    </div>
  );
} 