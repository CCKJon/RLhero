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

type SearchResult = {
  id: string
  username?: string
  email?: string
  character?: {
    level?: number
    name?: string
  }
  isFriend?: boolean
  requestStatus?: 'pending' | 'declined' | 'accepted'
}

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
  const [partySearchQuery, setPartySearchQuery] = useState('')
  const [guildSearchQuery, setGuildSearchQuery] = useState('')
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
    try {
      const requests = await getPendingFriendRequests(user.uid)
      setPendingRequests(requests)
      
      // Load profiles for pending requests
      const profiles: Record<string, { username?: string; character?: { name?: string; level?: number } }> = {}
      for (const request of requests) {
        const profile = await getUserProfile(request.fromUserId)
        profiles[request.fromUserId] = profile
      }
      setPendingRequestProfiles(profiles)
    } catch (error) {
      console.error('Error loading pending requests:', error)
    }
  }

  const loadSentRequests = async () => {
    if (!user) return
    try {
      const sentRequests = await getSentFriendRequests(user.uid)
      setSentRequests(new Set(sentRequests.map(req => req.toUserId)))
    } catch (error) {
      console.error('Error loading sent requests:', error)
    }
  }

  const loadFriends = async () => {
    if (!user) return
    try {
      const friendsList = await getFriendsList(user.uid)
      setFriends(friendsList)
    } catch (error) {
      console.error('Error loading friends:', error)
    }
  }

  const handleSendFriendRequest = async (toUserId: string) => {
    if (!user) return
    
    try {
      await sendFriendRequest(user.uid, toUserId)
      setSentRequests(prev => new Set(Array.from(prev).concat(toUserId)))
      setSuccessMessage('Friend request sent!')
      setErrorMessage(null)
      
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
      
      // Get all users and filter in memory for email and character name matches only
      const allUsersSnapshot = await getDocs(usersRef)
      const matches = allUsersSnapshot.docs.filter(doc => {
        const data = doc.data()
        const email = data.email?.toLowerCase()
        const characterName = data.character?.name?.toLowerCase()
        
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
        
        return false
      })
      
      // Convert matches to search results
      const results: SearchResult[] = matches.map(doc => {
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
          
          result.isFriend = isFriend
          result.requestStatus = requestStatus === 'none' ? undefined : requestStatus
        }
      }
      
      setSearchResults(filteredResults)
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-display text-white mb-2">SOCIAL HUB</h1>
        <p className="text-gray-400 text-sm mb-4">Connect with friends, join parties, and guilds to enhance your journey</p>

        {/* Mobile Tab Bar - full width, scrollable, no dropdown */}
        <div className="w-full sm:hidden">
          <div className="flex overflow-x-auto whitespace-nowrap gap-2 no-scrollbar px-2 py-2 border-b border-gray-800 mb-4">
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
        <div className="hidden sm:flex border-b border-gray-800 mb-6 gap-2 overflow-x-auto">
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

        {/* Error and Success Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-200 text-sm">
            {successMessage}
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
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

          {activeTab === 'find-friends' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by character name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleSearch(e.target.value)
                  }}
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-400"></div>
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-white font-medium">Search Results</h3>
                  {searchResults.map(user => (
                    <div key={user.id} className="bg-gray-800/60 border border-gray-700 rounded-lg flex items-center px-3 py-2 gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold text-base">
                        {getSearchResultDisplayName(user).charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{getSearchResultDisplayName(user)}</div>
                        <div className="text-xs text-gray-400 truncate">Level {user.character?.level || '-'}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {user.isFriend ? (
                          <span className="text-xs text-green-400 px-2 py-1">Friends</span>
                        ) : user.requestStatus === 'pending' ? (
                          <span className="text-xs text-yellow-400 px-2 py-1">Request Sent</span>
                        ) : (
                          <button 
                            className="btn btn-primary btn-mobile text-xs px-3 py-1"
                            onClick={() => handleSendFriendRequest(user.id)}
                          >
                            Add Friend
                          </button>
                        )}
                        <Link href={`/profile/${user.id}`} className="text-xs text-accent-400 text-center mt-1">Profile</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {searchResults.length === 0 && searchQuery === '' && (
                <div className="text-gray-400 text-center py-8">
                  Search for users by their character name or email address
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-party' && (
            <div className="space-y-4">
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">My Party</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">You haven't joined any parties yet.</p>
              </div>
            </div>
          )}

          {activeTab === 'find-party' && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search parties..."
                  value={partySearchQuery}
                  onChange={(e) => setPartySearchQuery(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Empty State */}
              <div className="text-gray-400 text-center py-8">
                No parties available to join at the moment.
              </div>
            </div>
          )}

          {activeTab === 'my-guild' && (
            <div className="space-y-4">
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">My Guild</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">You haven't joined any guilds yet.</p>
              </div>
            </div>
          )}

          {activeTab === 'find-guild' && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search guilds..."
                  value={guildSearchQuery}
                  onChange={(e) => setGuildSearchQuery(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Empty State */}
              <div className="text-gray-400 text-center py-8">
                No guilds available to join at the moment.
              </div>
            </div>
          )}

          {activeTab === 'pending-requests' && (
            <div className="space-y-4">
              {/* Friend Requests */}
              <div>
                <h3 className="text-white font-medium mb-3">Friend Requests ({pendingRequests.length})</h3>
                {pendingRequests.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">No pending friend requests</div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map(request => {
                      const profile = pendingRequestProfiles[request.fromUserId]
                      return (
                        <div key={request.id} className="bg-gray-800/60 border border-gray-700 rounded-lg flex items-center px-3 py-2 gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold text-base">
                            {getPendingRequestDisplayName(profile).charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">{getPendingRequestDisplayName(profile)}</div>
                            <div className="text-xs text-gray-400 truncate">Level {profile?.character?.level || '-'}</div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="btn btn-primary btn-mobile text-xs px-3 py-1"
                              onClick={() => handleAcceptRequest(request.id)}
                            >
                              Accept
                            </button>
                            <button 
                              className="btn btn-secondary btn-mobile text-xs px-3 py-1"
                              onClick={() => handleDeclineRequest(request.id)}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Party Requests */}
              <div>
                <h3 className="text-white font-medium mb-3">Party Requests (0)</h3>
                <div className="text-gray-400 text-center py-4">No pending party requests</div>
              </div>

              {/* Guild Requests */}
              <div>
                <h3 className="text-white font-medium mb-3">Guild Requests (0)</h3>
                <div className="text-gray-400 text-center py-4">No pending guild requests</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 