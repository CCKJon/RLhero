import { db } from './firebase'
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  query,
  where,
  getDocs
} from 'firebase/firestore'

export interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

export interface FriendData {
  id: string
  username: string
  character?: {
    level?: number
  }
}

export async function sendFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
  const friendRequestsRef = collection(db, 'friendRequests')
  const requestId = `${fromUserId}_${toUserId}`
  
  // Check if request already exists
  const existingRequest = await getDoc(doc(friendRequestsRef, requestId))
  if (existingRequest.exists()) {
    throw new Error('Friend request already exists')
  }
  
  // Create new friend request
  await setDoc(doc(friendRequestsRef, requestId), {
    id: requestId,
    fromUserId,
    toUserId,
    status: 'pending',
    createdAt: new Date().toISOString()
  })
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
  const requestRef = doc(db, 'friendRequests', requestId)
  const requestDoc = await getDoc(requestRef)
  
  if (!requestDoc.exists()) {
    throw new Error('Friend request not found')
  }
  
  const request = requestDoc.data() as FriendRequest
  
  // Update request status
  await updateDoc(requestRef, { status: 'accepted' })
  
  // Add each user to the other's friends list
  const fromUserRef = doc(db, 'users', request.fromUserId)
  const toUserRef = doc(db, 'users', request.toUserId)
  
  await updateDoc(fromUserRef, {
    friends: arrayUnion(request.toUserId)
  })
  
  await updateDoc(toUserRef, {
    friends: arrayUnion(request.fromUserId)
  })
}

export async function declineFriendRequest(requestId: string): Promise<void> {
  const requestRef = doc(db, 'friendRequests', requestId)
  await updateDoc(requestRef, { status: 'declined' })
}

export async function getPendingFriendRequests(userId: string): Promise<FriendRequest[]> {
  const friendRequestsRef = collection(db, 'friendRequests')
  const q = query(
    friendRequestsRef,
    where('toUserId', '==', userId),
    where('status', '==', 'pending')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data() as FriendRequest)
}

export async function getFriendsList(userId: string): Promise<FriendData[]> {
  const userRef = doc(db, 'users', userId)
  const userDoc = await getDoc(userRef)
  
  if (!userDoc.exists()) {
    return []
  }
  
  const friendIds = userDoc.data().friends || []
  const friendsData: FriendData[] = []
  
  // Fetch data for each friend
  for (const friendId of friendIds) {
    const friendDoc = await getDoc(doc(db, 'users', friendId))
    if (friendDoc.exists()) {
      const data = friendDoc.data()
      friendsData.push({
        id: friendId,
        username: data.username,
        character: data.character
      })
    }
  }
  
  return friendsData
}

export async function removeFriend(userId: string, friendId: string): Promise<void> {
  const userRef = doc(db, 'users', userId)
  const friendRef = doc(db, 'users', friendId)
  
  await updateDoc(userRef, {
    friends: arrayRemove(friendId)
  })
  
  await updateDoc(friendRef, {
    friends: arrayRemove(userId)
  })
} 