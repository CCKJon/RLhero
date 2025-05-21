'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange, signOutUser } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { motion } from 'framer-motion';
import Image from 'next/image';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          className="bg-dark/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
              </div>
            </div>

            {/* User Information */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-400">Email</label>
                    <p className="mt-1 text-white">{user?.email}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-400">User ID</label>
                    <p className="mt-1 text-white">{user?.uid}</p>
                  </div>
                </div>
              </div>

              {character && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Character Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(character.stats).map(([stat, value]) => (
                      <div key={stat} className="bg-gray-800/50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-400 capitalize">{stat}</label>
                        <p className="mt-1 text-xl font-bold text-primary-400">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {character?.skills.map((skill) => (
                    <div key={skill.name} className="bg-gray-800/50 rounded-lg p-4">
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
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-500/20 text-red-400 px-4 py-3 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 