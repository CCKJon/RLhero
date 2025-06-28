import { db } from './firebase'
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  addDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  DocumentData,
  limit
} from 'firebase/firestore'

export interface Message {
  id: string
  senderId: string
  content: string
  timestamp: Timestamp
  read: boolean
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage?: {
    content: string
    timestamp: Timestamp
    senderId: string
  }
  unreadCount: number
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

// Create or get existing conversation between two users
export async function getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
  const conversationsRef = collection(db, 'conversations')
  
  // Check if conversation already exists
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId1)
  )
  
  const snapshot = await getDocs(q)
  const existingConversation = snapshot.docs.find((doc: DocumentData) => {
    const data = doc.data()
    return data.participants.includes(userId2)
  })
  
  if (existingConversation) {
    return existingConversation.id
  }
  
  // Create new conversation
  const newConversation = {
    participants: [userId1, userId2],
    lastMessage: null,
    unreadCount: 0,
    createdAt: serverTimestamp()
  }
  
  const docRef = await addDoc(conversationsRef, newConversation)
  return docRef.id
}

// Send a message
export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<void> {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages')
  const conversationRef = doc(db, 'conversations', conversationId)
  
  // Add message to subcollection
  await addDoc(messagesRef, {
    senderId,
    content,
    timestamp: serverTimestamp(),
    read: false
  })
  
  // Update conversation with last message
  await updateDoc(conversationRef, {
    lastMessage: {
      content,
      timestamp: serverTimestamp(),
      senderId
    },
    unreadCount: 0 // Reset unread count for sender
  })
}

// Get conversation messages with real-time updates
export function subscribeToMessages(
  conversationId: string, 
  callback: (messages: Message[]) => void
): () => void {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages')
  const q = query(messagesRef, orderBy('timestamp', 'asc'))
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[]
    callback(messages)
  })
}

// Get user's conversations
export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const conversationsRef = collection(db, 'conversations')
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId)
  )
  
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Conversation[]
    
    // Sort conversations by last message timestamp (most recent first)
    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp?.toMillis?.() || 0
      const timeB = b.lastMessage?.timestamp?.toMillis?.() || 0
      return timeB - timeA
    })
    
    callback(conversations)
  })
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages')
  const q = query(
    messagesRef,
    where('read', '==', false)
  )
  
  const snapshot = await getDocs(q)
  const batch = writeBatch(db)
  
  // Filter messages that are not from the current user
  snapshot.docs.forEach((doc: DocumentData) => {
    const data = doc.data()
    if (data.senderId !== userId) {
      batch.update(doc.ref, { read: true })
    }
  })
  
  await batch.commit()
  
  // Update conversation unread count
  const conversationRef = doc(db, 'conversations', conversationId)
  await updateDoc(conversationRef, { unreadCount: 0 })
}

// Get conversation by ID
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const conversationRef = doc(db, 'conversations', conversationId)
  const conversationDoc = await getDoc(conversationRef)
  
  if (!conversationDoc.exists()) {
    return null
  }
  
  return {
    id: conversationDoc.id,
    ...conversationDoc.data()
  } as Conversation
}

// Get the most recent message for a conversation
export async function getMostRecentMessage(conversationId: string): Promise<Message | null> {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages')
  const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1))
  
  const snapshot = await getDocs(q)
  if (snapshot.empty) {
    return null
  }
  
  const doc = snapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data()
  } as Message
} 