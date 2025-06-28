'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageCircle, FiX } from 'react-icons/fi'
import { useAuthStore } from '@/store/authStore'
import { useMessagingStore } from '@/store/messagingStore'
import { getFriendsList, type FriendData } from '@/lib/friends'
import { 
  getOrCreateConversation, 
  subscribeToConversations,
  getMostRecentMessage,
  type Conversation,
  type Message
} from '@/lib/messaging'
import ChatWindow from './ChatWindow'

interface MessagingWidgetProps {
  className?: string
}

export default function MessagingWidget({ className = '' }: MessagingWidgetProps) {
  const [friends, setFriends] = useState<FriendData[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [recentMessages, setRecentMessages] = useState<Record<string, Message>>({})
  const { user } = useAuthStore()
  const { isOpen, activeView, openChats, actions } = useMessagingStore()
  const messagingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user && isOpen) {
      loadFriends()
    }
  }, [user, isOpen])

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToConversations(user.uid, (newConversations) => {
        setConversations(newConversations)
        // Fetch recent messages for conversations without lastMessage
        fetchRecentMessagesForConversations(newConversations)
      })
      return unsubscribe
    }
  }, [user])

  // Handle click outside to minimize messaging
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && messagingRef.current && !messagingRef.current.contains(event.target as Node)) {
        actions.closeMessaging()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, actions])

  const loadFriends = async () => {
    if (!user) return
    try {
      const friendsList = await getFriendsList(user.uid)
      setFriends(friendsList)
    } catch (error) {
      console.error('Error loading friends:', error)
    }
  }

  const fetchRecentMessagesForConversations = async (conversations: Conversation[]) => {
    const messagesToFetch: Record<string, string> = {}
    
    conversations.forEach(conversation => {
      if (!conversation.lastMessage) {
        messagesToFetch[conversation.id] = conversation.id
      }
    })
    
    // Fetch recent messages for conversations without lastMessage
    for (const conversationId of Object.values(messagesToFetch)) {
      try {
        const recentMessage = await getMostRecentMessage(conversationId)
        if (recentMessage) {
          setRecentMessages(prev => ({
            ...prev,
            [conversationId]: recentMessage
          }))
        }
      } catch (error) {
        console.error('Error fetching recent message:', error)
      }
    }
  }

  const handleOpenConversation = async (friend: FriendData) => {
    if (!user) return
    
    try {
      const conversationId = await getOrCreateConversation(user.uid, friend.id)
      actions.openConversation(friend, conversationId)
    } catch (error) {
      console.error('Error opening conversation:', error)
    }
  }

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unreadCount || 0
  }

  const getConversationFriend = (conversation: Conversation) => {
    if (!user) return null
    const friendId = conversation.participants.find(id => id !== user.uid)
    return friends.find(friend => friend.id === friendId)
  }

  const getConversationForFriend = (friend: FriendData) => {
    return conversations.find(conversation => {
      const conversationFriend = getConversationFriend(conversation)
      return conversationFriend?.id === friend.id
    })
  }

  const getDisplayMessage = (conversation: Conversation) => {
    // First try to use lastMessage from conversation
    if (conversation.lastMessage) {
      return conversation.lastMessage
    }
    
    // If no lastMessage, try to use recent message from state
    const recentMessage = recentMessages[conversation.id]
    if (recentMessage) {
      return {
        content: recentMessage.content,
        timestamp: recentMessage.timestamp,
        senderId: recentMessage.senderId
      }
    }
    
    return null
  }

  // Sort friends by conversation activity (most recent first)
  const sortedFriends = friends.sort((a, b) => {
    const conversationA = getConversationForFriend(a)
    const conversationB = getConversationForFriend(b)
    
    // If both have conversations, sort by last message timestamp
    const messageA = conversationA ? getDisplayMessage(conversationA) : null
    const messageB = conversationB ? getDisplayMessage(conversationB) : null
    
    if (messageA?.timestamp && messageB?.timestamp) {
      const timeA = messageA.timestamp.toMillis?.() || 0
      const timeB = messageB.timestamp.toMillis?.() || 0
      return timeB - timeA
    }
    
    // If only one has conversation, prioritize it
    if (messageA?.timestamp && !messageB?.timestamp) {
      return -1
    }
    if (!messageA?.timestamp && messageB?.timestamp) {
      return 1
    }
    
    // If neither has conversation, sort alphabetically
    return a.username.localeCompare(b.username)
  })

  const totalUnreadCount = conversations.reduce((total, conv) => total + getUnreadCount(conv), 0)

  // Don't render anything if user is not logged in
  if (!user) {
    return null
  }

  return (
    <div ref={messagingRef} className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => actions.toggleMessaging()}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <FiMessageCircle size={20} className="sm:w-6 sm:h-6" />
        {totalUnreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </div>
        )}
      </motion.button>

      {/* Main Messaging Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 flex items-end space-x-2"
          >
            {/* Friends List */}
            {activeView === 'friends' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-72 sm:w-80 h-80 sm:h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700">
                  <h3 className="text-white font-medium">Messages</h3>
                  <button
                    onClick={() => actions.closeMessaging()}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <FiX size={20} className="text-gray-300" />
                  </button>
                </div>

                {/* Friends List */}
                <div className="flex-1 overflow-y-auto">
                  {sortedFriends.length > 0 ? (
                    <div className="p-2">
                      {sortedFriends.map(friend => {
                        const conversation = getConversationForFriend(friend)
                        const displayMessage = conversation ? getDisplayMessage(conversation) : null
                        
                        return (
                          <div
                            key={friend.id}
                            onClick={() => handleOpenConversation(friend)}
                            className="flex items-center p-2 sm:p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-800 rounded-full flex items-center justify-center text-white mr-2 sm:mr-3 flex-shrink-0">
                              {friend.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-white font-medium truncate text-sm sm:text-base">{friend.character?.name}</p>
                                {conversation && getUnreadCount(conversation) > 0 && (
                                  <span className="bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ml-2">
                                    {getUnreadCount(conversation) > 99 ? '99+' : getUnreadCount(conversation)}
                                  </span>
                                )}
                              </div>
                              {displayMessage ? (
                                <p className="text-gray-400 text-xs sm:text-sm truncate max-w-32 sm:max-w-48">
                                  {displayMessage.content.length > 40 
                                    ? `${displayMessage.content.substring(0, 40)}...` 
                                    : displayMessage.content}
                                </p>
                              ) : (
                                <p className="text-gray-500 text-xs sm:text-sm truncate">
                                  No messages yet
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>No friends yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Chat Windows */}
            <AnimatePresence>
              {openChats.map((chat, index) => (
                <ChatWindow
                  key={chat.friend.id}
                  friend={chat.friend}
                  conversationId={chat.conversationId}
                  onClose={() => actions.closeChat(chat.friend.id)}
                  isActive={index === 0}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 