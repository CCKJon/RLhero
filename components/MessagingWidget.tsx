'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageCircle, FiX, FiSend, FiChevronLeft } from 'react-icons/fi'
import { useAuthStore } from '@/store/authStore'
import { useMessagingStore } from '@/store/messagingStore'
import { getFriendsList, type FriendData } from '@/lib/friends'
import { 
  getOrCreateConversation, 
  sendMessage, 
  subscribeToMessages, 
  subscribeToConversations,
  markMessagesAsRead,
  type Message, 
  type Conversation 
} from '@/lib/messaging'

interface MessagingWidgetProps {
  className?: string
}

export default function MessagingWidget({ className = '' }: MessagingWidgetProps) {
  const [friends, setFriends] = useState<FriendData[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()
  const { isOpen, activeView, selectedFriend, actions } = useMessagingStore()

  useEffect(() => {
    if (user && isOpen) {
      loadFriends()
      loadConversations()
    }
  }, [user, isOpen])

  useEffect(() => {
    if (currentConversationId) {
      const unsubscribe = subscribeToMessages(currentConversationId, (newMessages) => {
        setMessages(newMessages)
        scrollToBottom()
      })
      return unsubscribe
    }
  }, [currentConversationId])

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToConversations(user.uid, (newConversations) => {
        setConversations(newConversations)
      })
      return unsubscribe
    }
  }, [user])

  // Handle opening conversation from store
  useEffect(() => {
    if (selectedFriend && activeView === 'conversation' && user) {
      handleOpenConversation(selectedFriend)
    }
  }, [selectedFriend, activeView, user])

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleOpenConversation = async (friend: FriendData) => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const conversationId = await getOrCreateConversation(user.uid, friend.id)
      setCurrentConversationId(conversationId)
      
      // Mark messages as read
      await markMessagesAsRead(conversationId, user.uid)
    } catch (error) {
      console.error('Error opening conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversationId || !user) return
    
    try {
      await sendMessage(currentConversationId, user.uid, newMessage.trim())
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unreadCount || 0
  }

  const getConversationFriend = (conversation: Conversation) => {
    if (!user) return null
    const friendId = conversation.participants.find(id => id !== user.uid)
    return friends.find(friend => friend.id === friendId)
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
        {conversations.some(conv => getUnreadCount(conv) > 0) && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {conversations.reduce((total, conv) => total + getUnreadCount(conv), 0)}
          </div>
        )}
      </motion.button>

      {/* Pop-up Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center">
                {activeView === 'conversation' && (
                  <button
                    onClick={() => actions.goBackToFriends()}
                    className="mr-2 p-1 hover:bg-gray-700 rounded"
                  >
                    <FiChevronLeft size={20} className="text-gray-300" />
                  </button>
                )}
                <h3 className="text-white font-medium">
                  {activeView === 'friends' ? 'Messages' : selectedFriend?.username}
                </h3>
              </div>
              <button
                onClick={() => actions.closeMessaging()}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <FiX size={20} className="text-gray-300" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeView === 'friends' && (
                <div className="h-full overflow-y-auto">
                  {conversations.length > 0 ? (
                    <div className="p-2">
                      {conversations.map(conversation => {
                        const friend = getConversationFriend(conversation)
                        if (!friend) return null
                        
                        return (
                          <div
                            key={conversation.id}
                            onClick={() => actions.openConversation(friend)}
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
              )}

              {activeView === 'conversation' && (
                <div className="h-full flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                      </div>
                    ) : (
                      <>
                        {messages.map(message => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg ${
                                message.senderId === user?.uid
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-700 text-gray-200'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        <FiSend size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 