'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange, signOutUser } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

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
  const { character, actions: { resetState } } = useUserStore();

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
                  {Object.entries(character?.equipment || {}).map(([slot, item]) => (
                    <div key={slot} className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 capitalize">{slot}</label>
                      <p className="mt-1 text-white">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {character?.skills.map((skill) => (
                    <div key={skill.name} className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white">{skill.name}</span>
                        <span className="text-primary-400">Level {skill.level}</span>
                      </div>
                      <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500" 
                          style={{ width: `${skill.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Progress: {skill.progress}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Titles */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Titles</h3>
                <div className="flex flex-wrap gap-2">
                  {character?.titles.map((title) => (
                    <span 
                      key={title}
                      className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                    >
                      {title}
                    </span>
                  ))}
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