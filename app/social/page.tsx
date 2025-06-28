'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { collection, query as firestoreQuery, where, getDocs, DocumentData } from 'firebase/firestore'
import { useAuthStore } from '@/store/authStore'
import { useMessagingStore } from '@/store/messagingStore'
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest,
  getPendingFriendRequests,
  getSentFriendRequests,
  getFriendsList,
  getFriendRequestStatus,
  areUsersFriends,
  getUserProfile,
  type FriendRequest,
  type FriendData
} from '@/lib/friends'
import { getOrCreateConversation } from '@/lib/messaging'

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
  description: "A party of programmers and learners pushing each other to improve daily.",
  quests: [
    { id: 'q1', name: 'Party Study Session', progress: 70, reward: 'Tome of Collective Knowledge' },
    { id: 'q2', name: 'Team Exercise Challenge', progress: 45, reward: '200 Party XP' }
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

const CURRENT_GUILD = {
  id: 'g1',
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

const AVAILABLE_GUILDS = [
  {
    id: 'g2',
    name: "Morning Risers",
    level: 15,
    members: 8,
    focus: "Early morning productivity, fitness",
    openInvitations: true
  },
  {
    id: 'g3',
    name: "Creative Minds",
    level: 12,
    members: 6,
    focus: "Art, writing, music, design",
    openInvitations: false
  },
  {
    id: 'g4',
    name: "Fitness Warriors",
    level: 20,
    members: 12,
    focus: "Exercise, nutrition, health",
    openInvitations: true
  }
]

const MY_FRIENDS = [
  { id: 'f1', name: 'Sarah', level: 15, online: true, lastActive: '2m ago' },
  { id: 'f2', name: 'Mike', level: 12, online: false, lastActive: '1h ago' },
  { id: 'f3', name: 'Emma', level: 18, online: true, lastActive: '5m ago' },
]

const SUGGESTED_FRIENDS = [
  { id: 'sf1', name: 'Alex', level: 14, mutualFriends: 3 },
  { id: 'sf2', name: 'Lisa', level: 16, mutualFriends: 5 },
  { id: 'sf3', name: 'John', level: 11, mutualFriends: 2 },
]

type SearchResult = {
  id: string
  username?: string
  email?: string
  character?: {
    level?: number
    name?: string
  }
  isFriend?: boolean
  requestStatus?: 'pending' | 'declined'
}

// Add mock data for pending requests
const PENDING_FRIEND_REQUESTS = [
  { id: 'fr1', name: 'Alice', level: 15, sentAt: '2h ago' },
  { id: 'fr2', name: 'Bob', level: 12, sentAt: '1d ago' },
]

const PENDING_PARTY_REQUESTS = [
  { id: 'pr1', partyName: 'The Code Breakers', level: 8, sentAt: '3h ago' },
  { id: 'pr2', partyName: 'Morning Risers', level: 15, sentAt: '5h ago' },
]

const PENDING_GUILD_REQUESTS = [
  { id: 'gr1', guildName: 'Creative Minds', level: 12, sentAt: '1h ago' },
  { id: 'gr2', guildName: 'Fitness Warriors', level: 20, sentAt: '4h ago' },
]

export default function Social() {
  const [activeTab, setActiveTab] = useState<'my-friends' | 'find-friends' | 'my-party' | 'find-party' | 'my-guild' | 'find-guild' | 'pending-requests'>('my-friends')
  const [showTabDropdown, setShowTabDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [pendingRequestProfiles, setPendingRequestProfiles] = useState<Record<string, { username?: string; character?: { name?: string; level?: number } }>>({})
  const [friends, setFriends] = useState<FriendData[]>([])
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { actions: messagingActions } = useMessagingStore()

  // Mobile tab list
  const tabList = [
    { key: 'my-friends', label: 'My Friends' },
    { key: 'find-friends', label: 'Find Friends' },
    { key: 'my-party', label: 'My Party' },
    { key: 'find-party', label: 'Find Party' },
    { key: 'my-guild', label: 'My Guild' },
    { key: 'find-guild', label: 'Find Guild' },
    { key: 'pending-requests', label: 'Pending' },
  ]

  // Helper function to get display name (character name if available, otherwise username)
  const getDisplayName = (friend: FriendData) => {
    return friend.character?.name || friend.username
  }

  // Helper function for guild/party members
  const getMemberDisplayName = (member: { name: string; username?: string }) => {
    return member.name
  }

  // Helper function for search results
  const getSearchResultDisplayName = (user: SearchResult) => {
    return user.character?.name || user.username || 'Unknown'
  }

  // Helper function for pending request profiles
  const getPendingRequestDisplayName = (profile: { username?: string; character?: { name?: string; level?: number } }) => {
    return profile.character?.name || profile.username || 'Unknown'
  }

  useEffect(() => {
    if (user) {
      loadPendingRequests()
      loadSentRequests()
      loadFriends()
    }
  }, [user])

  const loadPendingRequests = async () => {
    if (!user) return
    const requests = await getPendingFriendRequests(user.uid)
    setPendingRequests(requests)
    // Fetch profile data for each sender
    const profiles: Record<string, { username?: string; character?: { name?: string; level?: number } }> = {}
    await Promise.all(requests.map(async (req) => {
      profiles[req.fromUserId] = await getUserProfile(req.fromUserId)
    }))
    setPendingRequestProfiles(profiles)
  }

  const loadSentRequests = async () => {
    if (!user) return
    const sentRequests = await getSentFriendRequests(user.uid)
    const sentUserIds = new Set(sentRequests.map(req => req.toUserId))
    setSentRequests(sentUserIds)
  }

  const loadFriends = async () => {
    if (!user) return
    const friendsList = await getFriendsList(user.uid)
    setFriends(friendsList)
  }

  const handleSendFriendRequest = async (toUserId: string) => {
    if (!user) return
    try {
      await sendFriendRequest(user.uid, toUserId)
      setSentRequests(prev => new Set(Array.from(prev).concat(toUserId)))
      setErrorMessage(null)
      setSuccessMessage('Friend request sent successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Error sending friend request:', error)
      setSuccessMessage(null)
      // If the error is "Friend request already exists", update the UI state
      if (error instanceof Error && error.message === 'Friend request already exists') {
        setSentRequests(prev => new Set(Array.from(prev).concat(toUserId)))
        setErrorMessage('Friend request already sent!')
      } else if (error instanceof Error && error.message === 'Users are already friends') {
        setErrorMessage('You are already friends with this user!')
      } else if (error instanceof Error && error.message === 'Cannot send friend request to yourself') {
        setErrorMessage('You cannot send a friend request to yourself!')
      } else {
        setErrorMessage('Failed to send friend request. Please try again.')
      }
      
      // Clear error message after 3 seconds
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId)
      await loadPendingRequests()
      await loadFriends()
    } catch (error) {
      console.error('Error accepting friend request:', error)
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId)
      await loadPendingRequests()
    } catch (error) {
      console.error('Error declining friend request:', error)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const usersRef = collection(db, 'users')
      const searchTerm = query.toLowerCase().trim()
      console.log('Searching for:', searchTerm)
      
      // Get all users and filter in memory for both email and character name matches
      const allUsersSnapshot = await getDocs(usersRef)
      const matches = allUsersSnapshot.docs.filter(doc => {
        const data = doc.data()
        const email = data.email?.toLowerCase()
        const characterName = data.character?.name?.toLowerCase()
        const username = data.username?.toLowerCase()
        
        // Check for exact email match
        if (email === searchTerm) {
          console.log('Found exact email match:', data.email)
          return true
        }
        
        // Check for partial character name match
        if (characterName && characterName.includes(searchTerm)) {
          console.log('Found character name match:', data.character?.name)
          return true
        }
        
        // Check for partial username match
        if (username && username.includes(searchTerm)) {
          console.log('Found username match:', data.username)
          return true
        }
        
        return false
      })
      
      // Convert matches to search results
      const results = matches.map(doc => {
        const data = doc.data() as DocumentData
        return {
          id: doc.id,
          username: data.username,
          email: data.email,
          character: data.character
        }
      })
      
      // Filter out the current user from results
      const filteredResults = results.filter(result => result.id !== user?.uid)
      
      // Check friend status for each result
      if (user) {
        for (const result of filteredResults) {
          const isFriend = await areUsersFriends(user.uid, result.id)
          const requestStatus = await getFriendRequestStatus(user.uid, result.id)
          
          if (isFriend) {
            (result as SearchResult).isFriend = true
          } else if (requestStatus === 'pending') {
            (result as SearchResult).requestStatus = 'pending'
          } else if (requestStatus === 'declined') {
            (result as SearchResult).requestStatus = 'declined'
          }
        }
      }
      
      console.log('Final results:', filteredResults)
      setSearchResults(filteredResults)
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleMessageFriend = async (friend: FriendData) => {
    if (!user) return
    
    try {
      const conversationId = await getOrCreateConversation(user.uid, friend.id)
      messagingActions.openConversation(friend, conversationId)
    } catch (error) {
      console.error('Error opening conversation:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-gray-900">
      <div className="max-w-2xl mx-auto px-0 sm:px-4 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-display text-white mb-2 px-4 sm:px-0">SOCIAL HUB</h1>
        <p className="text-gray-400 text-sm mb-4 px-4 sm:px-0">Connect with friends, join parties, and guilds to enhance your journey</p>

        {/* Mobile Tab Bar - full width, scrollable, no dropdown */}
        <div className="relative w-full">
          {/* Left gradient fade */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-6 z-10 bg-gradient-to-r from-dark via-dark/80 to-transparent" />
          {/* Right gradient fade */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-6 z-10 bg-gradient-to-l from-dark via-dark/80 to-transparent" />
          <div className="flex overflow-x-auto whitespace-nowrap gap-2 no-scrollbar px-0 sm:px-0 py-2 border-b border-gray-800 mb-4">
            {tabList.map(tab => (
              <button
                key={tab.key}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap flex-shrink-0 ${activeTab === tab.key ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                style={{ minWidth: 80 }}
                onClick={() => setActiveTab(tab.key as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Tab Bar */}
        <div className="hidden sm:flex border-b border-gray-800 mb-6 gap-2 overflow-x-auto px-0">
          {tabList.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === tab.key ? 'text-accent-400 border-b-2 border-accent-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab(tab.key as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-4 sm:px-0">
          {activeTab === 'my-friends' && (
            <div className="space-y-3">
              {friends.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No friends yet.</div>
              ) : (
                friends.map(friend => (
                  <div key={friend.id} className="bg-gray-800/60 border border-gray-700 rounded-lg flex items-center px-3 py-2 gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold text-base">
                      {friend.character?.name?.charAt(0) || friend.username?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{getDisplayName(friend)}</div>
                      <div className="text-xs text-gray-400 truncate">Level {friend.character?.level || '-'}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button 
                        className="btn btn-primary btn-mobile text-xs px-3 py-1"
                        onClick={() => messagingActions.openConversation(friend, friend.id)}
                      >
                        Message
                      </button>
                      <Link href={`/profile/${friend.id}`} className="text-xs text-accent-400 text-center mt-1">Profile</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {/* ...other tab content, refactor similarly for mobile... */}
        </div>
      </div>
    </div>
  )
} 