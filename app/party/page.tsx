'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

// Mock data
const CURRENT_PARTY = {
  id: 'p1',
  name: "The Code Breakers",
  level: 8,
  members: [
    { id: 'u1', name: 'Hiroshi', level: 12, role: 'Leader', avatar: '/images/avatars/avatar1.png', online: true },
    { id: 'u2', name: 'Yuki', level: 10, role: 'Member', avatar: '/images/avatars/avatar2.png', online: false },
    { id: 'u3', name: 'Akira', level: 9, role: 'Member', avatar: '/images/avatars/avatar3.png', online: true },
  ],
  description: "A guild of programmers and learners pushing each other to improve daily.",
  quests: [
    { id: 'q1', name: 'Guild Study Session', progress: 70, reward: 'Tome of Collective Knowledge' },
    { id: 'q2', name: 'Team Exercise Challenge', progress: 45, reward: '200 Guild XP' }
  ]
}

const AVAILABLE_PARTIES = [
  {
    id: 'p2',
    name: "Morning Risers",
    level: 15,
    members: 8,
    focus: "Early morning productivity, fitness",
    openInvitations: true
  },
  {
    id: 'p3',
    name: "Creative Minds",
    level: 12,
    members: 6,
    focus: "Art, writing, music, design",
    openInvitations: false
  },
  {
    id: 'p4',
    name: "Fitness Warriors",
    level: 20,
    members: 12,
    focus: "Exercise, nutrition, health",
    openInvitations: true
  }
]

export default function Party() {
  const [activeTab, setActiveTab] = useState<'my-party' | 'find-party'>('my-party')
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-dark pb-20">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-white">Party System</h1>
          <p className="text-gray-400">Team up with friends to tackle challenges together</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'my-party' 
                ? 'text-accent-400 border-b-2 border-accent-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('my-party')}
          >
            My Party
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'find-party' 
                ? 'text-accent-400 border-b-2 border-accent-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('find-party')}
          >
            Find Parties
          </button>
        </div>
        
        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'my-party' && (
            <div>
              <div className="bg-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Party Icon */}
                  <div className="w-24 h-24 bg-primary-900 rounded-lg flex items-center justify-center text-2xl font-bold text-white">
                    {CURRENT_PARTY.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-display font-bold text-white">
                          {CURRENT_PARTY.name}
                        </h2>
                        <p className="text-sm text-gray-400">
                          Guild Level {CURRENT_PARTY.level} • {CURRENT_PARTY.members.length} Members
                        </p>
                      </div>
                      
                      <button className="btn btn-secondary text-sm">
                        Invite Friends
                      </button>
                    </div>
                    
                    <p className="mt-2 text-gray-300">{CURRENT_PARTY.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Member List */}
                <div className="md:col-span-2">
                  <h3 className="text-xl font-medium text-white mb-4">Members</h3>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 divide-y divide-gray-700">
                    {CURRENT_PARTY.members.map(member => (
                      <div key={member.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="relative">
                            <div className="w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center text-white">
                              {member.name.charAt(0)}
                            </div>
                            {member.online && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                            )}
                          </div>
                          
                          <div className="ml-3">
                            <p className="text-white font-medium">{member.name}</p>
                            <p className="text-xs text-gray-400">Level {member.level} • {member.role}</p>
                          </div>
                        </div>
                        
                        <button className="text-sm text-primary-400 hover:text-primary-300">
                          View Profile
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Party Quests */}
                <div>
                  <h3 className="text-xl font-medium text-white mb-4">Party Quests</h3>
                  <div className="space-y-4">
                    {CURRENT_PARTY.quests.map(quest => (
                      <div key={quest.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                        <h4 className="font-medium text-white mb-1">{quest.name}</h4>
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>Progress</span>
                          <span>{quest.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                          <div 
                            className="h-full bg-accent-500" 
                            style={{ width: `${quest.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-accent-300 bg-accent-900/30 py-1 px-2 rounded inline-block">
                          Reward: {quest.reward}
                        </div>
                      </div>
                    ))}
                    
                    <button className="btn btn-primary w-full">
                      Create Party Quest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'find-party' && (
            <div>
              <div className="mb-6">
                <div className="relative rounded-md shadow-sm max-w-md">
                  <input
                    type="text"
                    className="input w-full pr-10"
                    placeholder="Search parties by name or focus..."
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_PARTIES.map(party => (
                  <div key={party.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-5 border border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium text-white">{party.name}</h3>
                      <span className="text-xs bg-primary-900/60 text-primary-300 py-1 px-2 rounded">
                        Lvl {party.level}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-4">{party.focus}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">{party.members} members</span>
                      
                      <button 
                        className={`btn text-sm ${
                          party.openInvitations 
                            ? 'btn-accent' 
                            : 'bg-gray-700 text-gray-300'
                        }`}
                        disabled={!party.openInvitations}
                      >
                        {party.openInvitations ? 'Join' : 'By Invitation'}
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="bg-gray-800/20 border border-dashed border-gray-700 rounded-lg p-5 flex flex-col items-center justify-center text-center">
                  <h3 className="text-lg font-medium text-white mb-2">Create Your Own Party</h3>
                  <p className="text-sm text-gray-400 mb-4">Found a group of motivated friends? Create a new party to work on goals together.</p>
                  <button className="btn btn-primary">
                    Create Party
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
} 