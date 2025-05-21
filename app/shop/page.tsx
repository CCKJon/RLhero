'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'gold' | 'premium';
  image: string;
  category: string;
}

const shopItems: ShopItem[] = [
  {
    id: 'basic_sword',
    name: 'Basic Sword',
    description: 'A reliable starting weapon',
    price: 100,
    currency: 'gold',
    image: '/items/basic_sword.png',
    category: 'weapons',
  },
  {
    id: 'premium_skin',
    name: 'Premium Skin',
    description: 'Exclusive character appearance',
    price: 5,
    currency: 'premium',
    image: '/items/premium_skin.png',
    category: 'cosmetics',
  },
  // Add more items as needed
];

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState<'gold' | 'premium'>('gold');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(shopItems.map(item => item.category)))];
  const filteredItems = shopItems.filter(
    item => item.currency === activeTab && (selectedCategory === 'all' || item.category === selectedCategory)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shop</h1>

      {/* Currency Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'gold'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => setActiveTab('gold')}
        >
          Gold Shop
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'premium'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => setActiveTab('premium')}
        >
          Premium Shop
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="relative h-48 bg-gray-100">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">
                  {item.price} {item.currency === 'gold' ? 'Gold' : 'Premium'}
                </span>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Purchase
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 