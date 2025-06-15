import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { auth, db } from '@/lib/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { reconcileUserData } from '@/utils/dataReconciliation'

type AuthState = {
  user: User | null
  isLoading: boolean
  error: string | null
  actions: {
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, username: string) => Promise<void>
    logout: () => Promise<void>
    clearError: () => void
  }
}

const initialState: Omit<AuthState, 'actions'> = {
  user: null,
  isLoading: true,
  error: null
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      actions: {
        login: async (email: string, password: string) => {
          try {
            set({ isLoading: true, error: null })
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            
            // Get user data and reconcile it
            const userRef = doc(db, 'users', userCredential.user.uid)
            const userDoc = await getDoc(userRef)
            if (userDoc.exists()) {
              await reconcileUserData(userCredential.user.uid, userDoc.data())
            }
            
            set({ user: userCredential.user, isLoading: false })
          } catch (error: any) {
            set({ 
              error: error.message || 'An error occurred during login',
              isLoading: false 
            })
            throw error
          }
        },

        register: async (email: string, password: string, username: string) => {
          try {
            set({ isLoading: true, error: null })
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            
            // Create user document in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              email,
              username,
              createdAt: new Date().toISOString()
            })

            set({ user: userCredential.user, isLoading: false })
          } catch (error: any) {
            set({ 
              error: error.message || 'An error occurred during registration',
              isLoading: false 
            })
            throw error
          }
        },

        logout: async () => {
          try {
            set({ isLoading: true, error: null })
            await firebaseSignOut(auth)
            set({ user: null, isLoading: false })
          } catch (error: any) {
            set({ 
              error: error.message || 'An error occurred during logout',
              isLoading: false 
            })
            throw error
          }
        },

        clearError: () => set({ error: null })
      }
    })
  )
)

// Initialize auth state listener
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get user data and reconcile it
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        await reconcileUserData(user.uid, userDoc.data())
      }
    }
    useAuthStore.setState({ user, isLoading: false })
  })
} 