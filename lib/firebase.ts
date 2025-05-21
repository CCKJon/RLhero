import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGXK-GtgTGvEx-gVA9PUurCfUgTM2KWNs",
  authDomain: "fir-practice-todo.firebaseapp.com",
  projectId: "fir-practice-todo",
  storageBucket: "fir-practice-todo.appspot.com",
  messagingSenderId: "1071871730626",
  appId: "1:1071871730626:web:e633b102a01af9b5182c5b"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Get Firebase services
const db = getFirestore(app)
const storage = getStorage(app)

// Auth state observer
export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback)
}

// Sign out function
export const signOutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

export { db, storage } 