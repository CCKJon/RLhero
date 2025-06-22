import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { FriendData } from '@/lib/friends'

interface OpenChat {
  friend: FriendData
  conversationId: string
}

type MessagingState = {
  isOpen: boolean
  activeView: 'friends' | 'conversation'
  selectedFriend: FriendData | null
  openChats: OpenChat[]
  actions: {
    openMessaging: () => void
    closeMessaging: () => void
    openConversation: (friend: FriendData, conversationId: string) => void
    closeChat: (friendId: string) => void
    goBackToFriends: () => void
  }
}

export const useMessagingStore = create<MessagingState>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      activeView: 'friends',
      selectedFriend: null,
      openChats: [],
      actions: {
        openMessaging: () => set({ isOpen: true, activeView: 'friends' }),
        closeMessaging: () => set({ 
          isOpen: false, 
          activeView: 'friends', 
          selectedFriend: null,
          openChats: []
        }),
        openConversation: (friend: FriendData, conversationId: string) => {
          const { openChats } = get()
          const existingChatIndex = openChats.findIndex(chat => chat.friend.id === friend.id)
          
          if (existingChatIndex !== -1) {
            // Chat already open, bring it to front
            const updatedChats = [...openChats]
            const [existingChat] = updatedChats.splice(existingChatIndex, 1)
            updatedChats.unshift(existingChat)
            set({ openChats: updatedChats })
          } else {
            // New chat
            const newChat: OpenChat = { friend, conversationId }
            let updatedChats = [newChat, ...openChats]
            
            // If we have more than 3 chats, remove the oldest one
            if (updatedChats.length > 3) {
              updatedChats = updatedChats.slice(0, 3)
            }
            
            set({ 
              isOpen: true, 
              activeView: 'conversation', 
              selectedFriend: friend,
              openChats: updatedChats
            })
          }
        },
        closeChat: (friendId: string) => {
          const { openChats } = get()
          const updatedChats = openChats.filter(chat => chat.friend.id !== friendId)
          set({ openChats: updatedChats })
          
          // If no chats left, go back to friends view
          if (updatedChats.length === 0) {
            set({ activeView: 'friends', selectedFriend: null })
          }
        },
        goBackToFriends: () => set({ activeView: 'friends', selectedFriend: null }),
      },
    }),
    {
      name: 'messaging-store',
    }
  )
) 