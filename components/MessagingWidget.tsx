'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageCircle, FiX } from 'react-icons/fi'
import { useAuthStore } from '@/store/authStore'
import { useMessagingStore } from '@/store/messagingStore'
import { getFriendsList, type FriendData } from '@/lib/friends'
import { 
  getOrCreateConversation, 
  subscribeToConversations,
  type Conversation 
} from '@/lib/messaging'
import ChatWindow from './ChatWindow'

interface MessagingWidgetProps {
  className?: string
}

export default function MessagingWidget({ className = '' }: MessagingWidgetProps) {
  const [friends, setFriends] = useState<FriendData[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const { user } = useAuthStore()
  const { isOpen, activeView, openChats, actions } = useMessagingStore()

  useEffect(() => {
    if (user && isOpen) {
      loadFriends()
      loadConversations()
    }
  }, [user, isOpen])

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToConversations(user.uid, (newConversations) => {
        setConversations(newConversations)
      })
      return unsubscribe
    }
  }, [user])

  const loadFriends = async () => {
    if (!user) return
    try {
      const friendsList = await getFriendsList(user.uid)
      setFriends(friendsList)
    } catch (error) {
      console.error('Error loading friends:', error)
    }
  }

  const loadConversations = async () => {
    if (!user) return
    // Conversations are loaded via real-time subscription
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

  const totalUnreadCount = conversations.reduce((total, conv) => total + getUnreadCount(conv), 0)

  // Don't render anything if user is not logged in
  if (!user) {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => actions.openMessaging()}
        className="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <FiMessageCircle size={24} />
        {totalUnreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {totalUnreadCount}
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
                className="w-80 h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
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
                  {conversations.length > 0 ? (
                    <div className="p-2">
                      {conversations.map(conversation => {
                        const friend = getConversationFriend(conversation)
                        if (!friend) return null
                        
                        return (
                          <div
                            key={conversation.id}
                            onClick={() => handleOpenConversation(friend)}
                            className="flex items-center p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center text-white mr-3">
                              {friend.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-white font-medium truncate">{friend.username}</p>
                                {getUnreadCount(conversation) > 0 && (
                                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    {getUnreadCount(conversation)}
                                  </span>
                                )}
                              </div>
                              {conversation.lastMessage && (
                                <p className="text-gray-400 text-sm truncate">
                                  {conversation.lastMessage.content}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>No conversations yet</p>
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