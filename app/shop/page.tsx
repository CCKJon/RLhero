'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import Image from 'next/image';
import { Equipment, EquipmentRarity, ARMOR_SETS, ALL_EQUIPMENT } from '@/types/equipment';
import ItemModal from '@/components/ItemModal';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-display text-white">Shop</h1>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Image 
                  src="/images/fire-emblem/gold-coin.png" 
                  alt="Gold" 
                  width={20} 
                  height={20}
                  className="mr-1"
                />
                <span className="text-yellow-400 font-bold">{character.gold || 0}</span>
              </div>
              <div className="flex items-center">
                <Image 
                  src="/images/fire-emblem/sp-coin.png" 
                  alt="SP" 
                  width={20} 
                  height={20}
                  className="mr-1"
                />
                <span className="text-purple-400 font-bold">{character.sp || 0}</span>
              </div>
              <div className="text-white">
                <span className="text-primary-400 font-bold">{character.experience || 0}</span> XP
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {['all', 'weapon', 'armor', 'accessory', 'consumable'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors flex flex-col h-full"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${rarityColors[item.rarity]}`}>{item.name}</h3>
                  <span className="text-sm text-gray-400">Level {item.level}</span>
                </div>
                
                <div className="w-full h-32 mb-4 flex items-center justify-center bg-gray-700/50 rounded-lg">
                  <Image 
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="opacity-90"
                  />
                </div>

                <p className="text-gray-400 text-sm mb-4">{item.description}</p>

                {/* Stats */}
                <div className="space-y-2 mb-4">
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
                    className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
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