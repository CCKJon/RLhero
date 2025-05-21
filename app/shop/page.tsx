'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import Image from 'next/image';

type ShopItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  image: string;
  stats?: {
    [key: string]: number;
  };
};

const shopItems: ShopItem[] = [
  {
    id: '1',
    name: 'Mystic Blade',
    description: 'A sword imbued with ancient magic. Increases strength and intelligence.',
    price: 500,
    type: 'weapon',
    image: '/images/fire-emblem/weapon-1.png',
    stats: {
      strength: 5,
      intelligence: 3
    }
  },
  {
    id: '2',
    name: 'Dragon Scale Armor',
    description: 'Armor crafted from dragon scales. Provides excellent protection.',
    price: 750,
    type: 'armor',
    image: '/images/fire-emblem/armor-1.png',
    stats: {
      constitution: 8,
      dexterity: 2
    }
  },
  {
    id: '3',
    name: 'Wisdom Amulet',
    description: 'An amulet that enhances your magical abilities.',
    price: 300,
    type: 'accessory',
    image: '/images/fire-emblem/accessory-1.png',
    stats: {
      wisdom: 5,
      intelligence: 3
    }
  },
  {
    id: '4',
    name: 'Health Potion',
    description: 'Restores health and provides temporary stat boosts.',
    price: 100,
    type: 'consumable',
    image: '/images/fire-emblem/potion-1.png'
  }
];

export default function ShopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ShopItem['type'] | 'all'>('all');
  const { character, actions: { gainExperience } } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handlePurchase = (item: ShopItem) => {
    // Here you would typically handle the purchase logic
    // For now, we'll just gain some XP
    gainExperience(item.price / 10);
    alert(`Purchased ${item.name}!`);
  };

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.type === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

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
            <div className="text-white">
              <span className="text-primary-400 font-bold">{character?.experience || 0}</span> XP
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
              <motion.div
                key={item.id}
                className="bg-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-display text-white mb-2">{item.name}</h2>
                <p className="text-gray-400 mb-4">{item.description}</p>
                
                {item.stats && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Stats:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(item.stats).map(([stat, value]) => (
                        <div key={stat} className="bg-gray-800/50 rounded p-2">
                          <span className="text-xs text-gray-400 capitalize">{stat}</span>
                          <span className="block text-primary-400 font-bold">+{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <span className="text-primary-400 font-bold">{item.price} XP</span>
                  <button
                    onClick={() => handlePurchase(item)}
                    className="bg-primary-500/20 text-primary-400 px-4 py-2 rounded-lg hover:bg-primary-500/30 transition-colors border border-primary-500/50"
                  >
                    Purchase
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 