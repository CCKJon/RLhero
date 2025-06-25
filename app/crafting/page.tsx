'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import Image from 'next/image';
import { Equipment, EquipmentRarity, ALL_EQUIPMENT } from '@/types/equipment';

const rarityColors: Record<EquipmentRarity, string> = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400'
};

// Craftable items - these would be items the user can craft
const CRAFTABLE_ITEMS: Equipment[] = [
  {
    id: 'iron-sword',
    name: 'Iron Sword',
    type: 'weapon',
    rarity: 'common',
    level: 5,
    stats: {
      strength: 3,
      damage: 5
    },
    description: 'A basic iron sword. Good for beginners.',
    image: '/images/fire-emblem/weapon-1.png',
    price: 100
  },
  {
    id: 'leather-armor',
    name: 'Leather Armor',
    type: 'top',
    rarity: 'common',
    level: 3,
    stats: {
      constitution: 2,
      defense: 3
    },
    description: 'Light leather armor providing basic protection.',
    image: '/images/fire-emblem/armor-1.png',
    price: 80
  },
  {
    id: 'steel-helmet',
    name: 'Steel Helmet',
    type: 'helm',
    rarity: 'uncommon',
    level: 8,
    stats: {
      constitution: 3,
      defense: 4
    },
    description: 'A sturdy steel helmet offering good head protection.',
    image: '/images/fire-emblem/helm-1.png',
    price: 150
  },
  {
    id: 'magic-staff',
    name: 'Magic Staff',
    type: 'weapon',
    rarity: 'rare',
    level: 12,
    stats: {
      intelligence: 5,
      wisdom: 3,
      damage: 7
    },
    description: 'A staff imbued with magical energy.',
    image: '/images/fire-emblem/weapon-4.png',
    price: 300
  }
];

export default function CraftingPage() {
  const router = useRouter();
  const { character, actions } = useUserStore();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'weapon' | 'armor' | 'accessory'>('all');
  const [isForgeActive, setIsForgeActive] = useState(false);
  const [craftingItem, setCraftingItem] = useState<Equipment | null>(null);
  const [craftingProgress, setCraftingProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (!user) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (isForgeActive && craftingItem) {
      const interval = setInterval(() => {
        setCraftingProgress((prev) => {
          if (prev >= 100) {
            setIsForgeActive(false);
            setCraftingItem(null);
            setCraftingProgress(0);
            // Here you would add the crafted item to inventory
            return 0;
          }
          return prev + 10;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isForgeActive, craftingItem]);

  const handleCraftItem = (item: Equipment) => {
    setCraftingItem(item);
    setIsForgeActive(true);
    setCraftingProgress(0);
  };

  if (!character) return null;

  const filteredItems = selectedCategory === 'all' 
    ? CRAFTABLE_ITEMS 
    : CRAFTABLE_ITEMS.filter(item => {
        if (selectedCategory === 'weapon') return item.type === 'weapon' || item.type === 'secondary';
        if (selectedCategory === 'armor') return ['helm', 'top', 'bottom', 'shoes', 'gloves'].includes(item.type);
        if (selectedCategory === 'accessory') return ['pendant', 'accessory'].includes(item.type);
        return true;
      });

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-display text-white">Crafting Forge</h1>
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
            </div>
          </div>

          {/* Forge Section */}
          <div className="mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display text-white">The Forge</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-sm">Hot</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Forge Visual */}
                <div className="relative">
                  <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-600 h-64 flex items-center justify-center">
                    {isForgeActive ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 animate-pulse"></div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${craftingProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-white text-sm">Crafting {craftingItem?.name}...</p>
                        <p className="text-gray-400 text-xs">{craftingProgress}%</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-400">Forge is ready</p>
                        <p className="text-gray-500 text-sm">Select an item to craft</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Forge Info */}
                <div className="space-y-4">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Crafting Requirements</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Level 3+ to craft basic items</li>
                      <li>• Level 8+ to craft uncommon items</li>
                      <li>• Level 12+ to craft rare items</li>
                      <li>• Gold cost varies by item rarity</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Crafting Skills</h3>
                    <div className="text-gray-300 text-sm">
                      <p>Your crafting skill: <span className="text-primary-400">{character.skills?.crafting || 0}</span></p>
                      <p className="text-gray-400 text-xs mt-1">Higher crafting skill increases success rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {['all', 'weapon', 'armor', 'accessory'].map((category) => (
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

          {/* Craftable Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors flex flex-col h-full"
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

                <div className="mt-auto">
                  <button
                    onClick={() => handleCraftItem(item)}
                    disabled={isForgeActive || character.level < item.level}
                    className={`w-full py-2 rounded-lg transition-colors ${
                      isForgeActive || character.level < item.level
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-500 text-white'
                    }`}
                  >
                    {character.level < item.level 
                      ? `Requires Level ${item.level}` 
                      : 'Craft Item'
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 