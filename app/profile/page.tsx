'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange, signOutUser } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { TITLE_BONUSES } from '@/lib/titles';
import { ARMOR_SETS, ALL_EQUIPMENT, Equipment } from '@/types/equipment';
import ItemModal from '@/components/ItemModal';
import { getCharacterImagePathWithSeed } from '@/utils/characterImage';

// Define available skills and their unlock levels
const AVAILABLE_SKILLS = [
  {
    name: 'Sword Mastery',
    description: 'Increases damage with swords by 10% per level',
    unlockLevel: 1,
    category: 'Combat'
  },
  {
    name: 'Basic Magic',
    description: 'Increases spell damage by 5% per level',
    unlockLevel: 1,
    category: 'Magic'
  },
  {
    name: 'Fitness',
    description: 'Increases health and stamina by 8% per level',
    unlockLevel: 1,
    category: 'Physical'
  },
  {
    name: 'Study',
    description: 'Increases experience gain by 5% per level',
    unlockLevel: 1,
    category: 'Academic'
  },
  {
    name: 'Archery',
    description: 'Increases accuracy and damage with bows by 15% per level',
    unlockLevel: 5,
    category: 'Combat'
  },
  {
    name: 'Magic Affinity',
    description: 'Increases spell damage and reduces mana cost by 12% per level',
    unlockLevel: 10,
    category: 'Magic'
  },
  {
    name: 'Stealth',
    description: 'Increases chance to avoid detection and critical hit chance by 8% per level',
    unlockLevel: 15,
    category: 'Utility'
  },
  {
    name: 'Leadership',
    description: 'Increases party member stats by 5% per level',
    unlockLevel: 20,
    category: 'Social'
  },
  {
    name: 'Alchemy',
    description: 'Increases potion effectiveness and crafting success rate by 15% per level',
    unlockLevel: 25,
    category: 'Crafting'
  }
] as const;

type AvailableSkill = typeof AVAILABLE_SKILLS[number];

// Race descriptions and bonuses
const RACE_INFO = {
  human: {
    description: "Versatile and adaptable, humans excel in social situations and can learn any skill quickly.",
    bonuses: {
      wisdom: 2,
      charisma: 2
    }
  },
  elf: {
    description: "Graceful and intelligent, elves have a natural affinity for magic and archery.",
    bonuses: {
      intelligence: 2,
      dexterity: 2
    }
  },
  dwarf: {
    description: "Sturdy and resilient, dwarves are masters of crafting and combat.",
    bonuses: {
      constitution: 2,
      strength: 2
    }
  },
  orc: {
    description: "Powerful and intimidating, orcs are natural warriors with incredible strength.",
    bonuses: {
      strength: 2,
      constitution: 2
    }
  },
  kitsune: {
    description: "Agile and cunning, kitsune are masters of illusion and quick combat.",
    bonuses: {
      dexterity: 2,
      intelligence: 2
    }
  }
};

const EQUIPMENT_SLOT_DISPLAY: Record<string, string> = {
  helm: 'Helm',
  top: 'Top',
  bottom: 'Bottom',
  secondary: 'Secondary',
  weapon: 'Weapon',
  gloves: 'Gloves',
  shoes: 'Shoes',
  pendant: 'Pendant',
  accessory: 'Accessory',
  consumable: 'Consumable',
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { character, actions: { resetState, setAppliedTitle, equipItem, unequipItem, removeFromInventory } } = useUserStore();
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Remove broken Shadow Assassin's Hood from inventory if equipped
    if (character && character.equipment && character.equipment.helm && character.equipment.helm.id === 'assassin-hood') {
      if (character.inventory.some(item => item.id === 'assassin-hood')) {
        removeFromInventory('assassin-hood');
      }
    }
  }, [character, removeFromInventory]);

  const handleSignOut = async () => {
    await signOutUser();
    resetState();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark flex items-center justify-center">
        <div className="text-white">No character data available</div>
      </div>
    );
  }

  const raceInfo = RACE_INFO[character?.race as keyof typeof RACE_INFO];

  // Hydrate equipment with full item data
  const hydratedEquipment = Object.fromEntries(
    Object.entries(character?.equipment || {}).map(([slot, item]) => [
      slot,
      item && typeof item === 'object' && item.id ? item : ALL_EQUIPMENT.find(e => e.id === (item?.id || item)) || null
    ])
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <motion.div 
          className="bg-dark/50 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Navigation */}
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <Link href="/dashboard" className="text-primary-400 hover:text-primary-300 text-sm sm:text-base">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Profile Image and Basic Info */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 sm:w-48 sm:h-48 rounded-lg overflow-hidden border-2 border-primary-500 mx-auto lg:mx-0">
                <Image 
                  src={getCharacterImagePathWithSeed(character.race, character.gender, character.id)}
                  alt={character.name}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="mt-4 sm:mt-6 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                  {character.name}
                </h1>
                <p className="text-gray-400 text-sm sm:text-base mb-2">
                  Level {character.level} {character.race}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mb-4">
                  {raceInfo?.description}
                </p>
                
                {/* Race Bonuses */}
                <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 mb-4">
                  <h3 className="text-sm sm:text-base font-medium text-white mb-2">Race Bonuses</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(raceInfo?.bonuses || {}).map(([stat, bonus]) => (
                      <div key={stat} className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-400 capitalize">{stat}</span>
                        <span className="text-primary-400">+{bonus}</span>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              </div>

            {/* Character Details */}
            <div className="flex-1 space-y-6 sm:space-y-8">
              {/* Stats */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700">
                <h2 className="text-lg sm:text-xl font-medium text-white mb-4">Character Stats</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {Object.entries(character.stats).map(([stat, value]) => (
                    <div key={stat} className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400 capitalize">{stat}</span>
                        <span className="text-sm font-medium text-white">{value}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent-500" 
                          style={{ width: `${(Number(value) / 20) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700">
                <h2 className="text-lg sm:text-xl font-medium text-white mb-4">Skills</h2>
                <div className="space-y-3 sm:space-y-4">
                  {Object.keys(character.skills).length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-gray-400">No skills learned yet.</p>
                      <p className="text-sm text-gray-500 mt-1">Complete quests to level up your skills!</p>
                    </div>
                  ) : (
                    Object.entries(character.skills).map(([skillName, level]) => (
                      <div key={skillName}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white truncate">{skillName}</span>
                          <span className="text-gray-400 flex-shrink-0 ml-2">Level {level}</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500" 
                            style={{ width: `${(level / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Equipment */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700">
                <h2 className="text-lg sm:text-xl font-medium text-white mb-4">Equipment</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {Object.entries(hydratedEquipment)
                    .filter(([slot]) => Object.keys(EQUIPMENT_SLOT_DISPLAY).includes(slot))
                    .map(([slot, item]) => (
                    <div 
                      key={slot} 
                      className="bg-gray-700/50 rounded-lg p-3 sm:p-4 relative cursor-pointer hover:border-gray-600 transition-colors h-[100px] sm:h-[120px] flex flex-col items-center justify-center"
                      onClick={() => item && setSelectedItem(item)}
                    >
                      <label className="block text-xs sm:text-sm font-medium text-gray-400 capitalize mb-1 sm:mb-2 text-center">{EQUIPMENT_SLOT_DISPLAY[slot]}</label>
                        {item ? (
                          <>
                          <div className="w-8 h-8 sm:w-12 sm:h-12 mb-1 sm:mb-2 flex items-center justify-center">
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                width={48} 
                                height={48} 
                              className="opacity-90 w-full h-full object-contain"
                              />
                            </div>
                          <p className="text-white text-xs sm:text-sm text-center line-clamp-1">{item.name}</p>
                            <p className="text-gray-400 text-xs mt-1">Level {item.level}</p>
                          </>
                        ) : (
                          <div className="text-center">
                          <p className="text-xs sm:text-sm text-gray-400">No {EQUIPMENT_SLOT_DISPLAY[slot]} equipped</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Set Bonuses */}
                {Object.values(character.equipment).some(item => item?.set) && (
                  <div className="mt-4 sm:mt-6">
                    <h4 className="text-sm font-medium text-white mb-3">Active Set Bonuses</h4>
                    <div className="space-y-3">
                      {ARMOR_SETS.map((set) => {
                        const equippedPieces = Object.values(character.equipment).filter(
                          item => item?.set === set.name
                        );
                        
                        if (equippedPieces.length === 0) return null;
                    
                    return (
                          <div key={set.name} className="bg-gray-700/30 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-white">{set.name}</span>
                              <span className="text-xs text-gray-400">
                                {equippedPieces.length}/{set.pieces.length} pieces
                              </span>
                            </div>
                            
                            {Object.entries(set.bonuses).map(([pieceCount, bonus]) => {
                              const isActive = equippedPieces.length >= parseInt(pieceCount);
                              return (
                                <div 
                                  key={pieceCount} 
                                  className={`text-xs ${isActive ? 'text-primary-400' : 'text-gray-500'}`}
                                >
                                  {pieceCount} pieces: {Object.entries(bonus as Record<string, number>).map(([stat, value]) => (
                                    <span key={stat} className="mr-2">
                                      +{value} {stat}
                                    </span>
                                  ))}
                            </div>
                              );
                            })}
                      </div>
                    );
                  })}
                </div>
                  </div>
                )}
              </div>

              {/* Titles */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700">
                <h2 className="text-lg sm:text-xl font-medium text-white mb-4">Titles</h2>
                <div className="grid grid-cols-1 gap-3">
                  {character.titles.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-gray-400">No titles earned yet.</p>
                      <p className="text-sm text-gray-500 mt-1">Complete achievements to earn titles!</p>
                          </div>
                  ) : (
                    character.titles.map((title, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-700/50 rounded-lg p-3 flex items-center"
                      >
                        <div className="w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-primary-300 text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-white truncate">{title}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
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