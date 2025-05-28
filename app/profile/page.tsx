'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange, signOutUser } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { TITLE_BONUSES } from '@/lib/titles';
import { ARMOR_SETS, ALL_EQUIPMENT } from '@/types/equipment';

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

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { character, actions: { resetState, setAppliedTitle } } = useUserStore();

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          className="bg-dark/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/dashboard" className="text-primary-400 hover:text-primary-300">
              ← Back to Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/50"
            >
              Sign Out
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image and Basic Info */}
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-primary-500">
                <Image 
                  src={`/images/fire-emblem/character-${character?.race || 'human'}.png`}
                  alt="Profile"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-display text-white">{character?.name || 'Adventurer'}</h2>
                <p className="text-sm text-gray-400">Level {character?.level || 1} {character?.race || 'Human'}</p>
                <div className="mt-2">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500" 
                      style={{ width: `${((character?.experience || 0) / (character?.nextLevelXp || 100)) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {character?.experience || 0} / {character?.nextLevelXp || 100} XP
                  </p>
                </div>
              </div>
            </div>

            {/* Character Information */}
            <div className="flex-1 space-y-6">
              {/* Race Description */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-2">Race: {character?.race}</h3>
                <p className="text-gray-300">{raceInfo?.description}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Racial Bonuses:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(raceInfo?.bonuses || {}).map(([stat, bonus]) => (
                      <div key={stat} className="flex items-center justify-between bg-gray-700/50 rounded px-3 py-1">
                        <span className="text-gray-300 capitalize">{stat}</span>
                        <span className="text-primary-400">+{bonus}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Character Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(character?.stats || {}).map(([stat, value]) => (
                    <div key={stat} className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 capitalize">{stat}</label>
                      <p className="mt-1 text-xl font-bold text-primary-400">{value}</p>
                      {raceInfo?.bonuses[stat as keyof typeof raceInfo.bonuses] && (
                        <p className="text-xs text-primary-300">
                          +{raceInfo.bonuses[stat as keyof typeof raceInfo.bonuses]} from race
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Equipment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(hydratedEquipment).map(([slot, item]) => (
                    <div key={slot} className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 capitalize mb-2">{slot}</label>
                      {item ? (
                        <>
                          <div className="w-full h-16 mb-3 flex items-center justify-center">
                            <Image 
                              src={item.image} 
                              alt={item.name} 
                              width={48} 
                              height={48} 
                              className="opacity-90"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-white font-medium">{item.name}</p>
                              <span className="text-xs text-gray-400">Level {item.level}</span>
                            </div>
                            
                            {/* Item Description */}
                            <p className="text-sm text-gray-400">{item.description}</p>
                            
                            {/* Item Stats */}
                            {item.stats && Object.entries(item.stats).length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs text-gray-400 font-medium">Stats:</p>
                                {Object.entries(item.stats).map(([stat, value]) => (
                                  <div key={stat} className="flex justify-between text-xs">
                                    <span className="text-gray-400 capitalize">{stat}</span>
                                    <span className="text-primary-400">+{value}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Set Bonus Info */}
                            {item.set && (
                              <div className="mt-2 p-2 bg-gray-700/30 rounded">
                                <p className="text-xs text-gray-300 mb-1">Part of {item.set}</p>
                                <p className="text-xs text-gray-400">
                                  {ARMOR_SETS.find(s => s.name === item.set)?.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-400">No {slot} equipped</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_SKILLS.map((skill) => {
                    const isUnlocked = (character?.level ?? 0) >= skill.unlockLevel;
                    const currentSkill = character?.skills.find(s => s.name === skill.name);
                    
                    return (
                      <div key={skill.name} className={`bg-gray-700/50 rounded-lg p-4 ${!isUnlocked ? 'opacity-60' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-white font-medium">{skill.name}</h4>
                            <p className="text-sm text-gray-400">{skill.description}</p>
                          </div>
                          {!isUnlocked ? (
                            <span className="text-sm font-medium text-gray-500">Unlocks at Level {skill.unlockLevel}</span>
                          ) : (
                            <span className="text-primary-400">Level {currentSkill?.level || 0}/10</span>
                          )}
                        </div>
                        {isUnlocked ? (
                          <>
                            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary-500" 
                                style={{ width: `${((currentSkill?.level || 0) / 10) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Max Level: 10
                            </p>
                          </>
                        ) : (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                              <span>Current Level</span>
                              <span>{character?.level ?? 0}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gray-600" 
                                style={{ width: `${((character?.level ?? 0) / skill.unlockLevel) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {skill.unlockLevel - (character?.level ?? 0)} levels remaining
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Titles */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Titles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: "Novice Adventurer",
                      description: "Your first step into the world of adventure",
                      requirements: "Complete the tutorial",
                      unlockLevel: 1
                    },
                    {
                      name: "Master of the Blade",
                      description: "Awarded for reaching level 10 in any combat skill",
                      requirements: "Level 10 in any combat skill",
                      unlockLevel: 10
                    },
                    {
                      name: "Arcane Scholar",
                      description: "Awarded for mastering three magic skills",
                      requirements: "Level 5 in three magic skills",
                      unlockLevel: 15
                    },
                    {
                      name: "Guild Leader",
                      description: "Awarded for leading a successful party",
                      requirements: "Complete 10 party quests as leader",
                      unlockLevel: 20
                    },
                    {
                      name: "Legendary Hero",
                      description: "The highest honor for completing all major quests",
                      requirements: "Complete all main story quests",
                      unlockLevel: 30
                    }
                  ].map((title) => {
                    const isUnlocked = character?.titles.includes(title.name);
                    const canUnlock = (character?.level ?? 0) >= title.unlockLevel;
                    const isApplied = character?.appliedTitle === title.name;
                    const titleBonus = TITLE_BONUSES[title.name];
                    
                    return (
                      <div key={title.name} className={`bg-gray-700/50 rounded-lg p-4 ${!canUnlock ? 'opacity-60' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-white font-medium">{title.name}</h4>
                            <p className="text-sm text-gray-400">{title.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Requirements: {title.requirements}</p>
                            {isUnlocked && titleBonus && (
                              <div className="mt-2">
                                <p className="text-xs text-accent-400 font-medium">Bonuses:</p>
                                {Object.entries(titleBonus.statBonus).map(([stat, value]) => (
                                  <p key={stat} className="text-xs text-gray-300">
                                    +{value} {stat.charAt(0).toUpperCase() + stat.slice(1)}
                                  </p>
                                ))}
                                {titleBonus.xpBonus && (
                                  <p className="text-xs text-gray-300">
                                    +{titleBonus.xpBonus}% XP Gain
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {!canUnlock ? (
                              <span className="text-sm font-medium text-gray-500">Unlocks at Level {title.unlockLevel}</span>
                            ) : isUnlocked ? (
                              <>
                                {isApplied ? (
                                  <span className="text-primary-400">Applied</span>
                                ) : (
                                  <button
                                    onClick={() => setAppliedTitle(title.name)}
                                    className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded"
                                  >
                                    Apply
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">Available</span>
                            )}
                          </div>
                        </div>
                        {!canUnlock && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                              <span>Current Level</span>
                              <span>{character?.level ?? 0}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gray-600" 
                                style={{ width: `${((character?.level ?? 0) / title.unlockLevel) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {title.unlockLevel - (character?.level ?? 0)} levels remaining
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
} 