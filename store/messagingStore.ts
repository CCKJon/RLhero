import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { FriendData } from '@/lib/friends'

type MessagingState = {
  isOpen: boolean
  activeView: 'friends' | 'conversation'
  selectedFriend: FriendData | null
  actions: {
    openMessaging: () => void
    closeMessaging: () => void
    openConversation: (friend: FriendData) => void
    goBackToFriends: () => void
  }
}

export const useMessagingStore = create<MessagingState>()(
  devtools(
    (set) => ({
      isOpen: false,
      activeView: 'friends',
      selectedFriend: null,
      actions: {
        openMessaging: () => set({ isOpen: true, activeView: 'friends' }),
        closeMessaging: () => set({ isOpen: false, activeView: 'friends', selectedFriend: null }),
        openConversation: (friend: FriendData) => set({ 
          isOpen: true, 
          activeView: 'conversation', 
          selectedFriend: friend 
        }),
        goBackToFriends: () => set({ activeView: 'friends', selectedFriend: null }),
      },
    }),
    {
      name: 'messaging-store',
    }
  )
) 