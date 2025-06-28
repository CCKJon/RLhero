'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiSend } from 'react-icons/fi'
import { useAuthStore } from '@/store/authStore'
import { useMessagingStore } from '@/store/messagingStore'
import { 
  sendMessage, 
  subscribeToMessages, 
  markMessagesAsRead,
  type Message 
} from '@/lib/messaging'
import type { FriendData } from '@/lib/friends'

interface ChatWindowProps {
  friend: FriendData
  conversationId: string
  onClose: () => void
  isActive: boolean
}

export default function ChatWindow({ friend, conversationId, onClose, isActive }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    if (conversationId) {
      const unsubscribe = subscribeToMessages(conversationId, (newMessages) => {
        setMessages(newMessages)
        scrollToBottom()
      })
      return unsubscribe
    }
  }, [conversationId])

  // Scroll to bottom when messages are first loaded
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages.length])

  useEffect(() => {
    if (isActive && conversationId && user) {
      markMessagesAsRead(conversationId, user.uid)
    }
  }, [isActive, conversationId, user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return
    
    try {
      await sendMessage(conversationId, user.uid, newMessage.trim())
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20 }}
      transition={{ duration: 0.2 }}
      className={`w-72 sm:w-80 h-80 sm:h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl flex flex-col ${
        isActive ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-700">
        <div className="flex items-center flex-1 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-800 rounded-full flex items-center justify-center text-white text-xs sm:text-sm mr-2 flex-shrink-0">
            {friend.username.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-white font-medium text-sm truncate max-w-32 sm:max-w-40">
            {friend.username}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded text-gray-300 hover:text-white flex-shrink-0"
        >
          <FiX size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-40 sm:max-w-48 px-2 py-1 rounded-lg text-xs ${
                    message.senderId === user?.uid
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <p className="text-xs break-words">{message.content}</p>
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
      <div className="p-2 sm:p-3 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white px-2 py-1 rounded text-xs border border-gray-600 focus:border-primary-500 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors flex-shrink-0"
          >
            <FiSend size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  )
} 