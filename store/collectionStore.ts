import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  DocumentData,
  Query,
  QueryConstraint,
  WithFieldValue
} from 'firebase/firestore'

type CollectionState<T> = {
  items: T[]
  item: T | null
  isLoading: boolean
  error: string | null
  unsubscribe: (() => void) | null
}

type CollectionActions<T> = {
  // CRUD Operations
  create: (data: Omit<T, 'id'>) => Promise<string>
  read: (id: string) => Promise<T | null>
  update: (id: string, data: Partial<T>) => Promise<void>
  delete: (id: string) => Promise<void>
  
  // Query Operations
  query: (constraints: QueryConstraint[]) => Promise<T[]>
  
  // Real-time Subscriptions
  subscribeToCollection: (constraints?: QueryConstraint[]) => void
  subscribeToDocument: (id: string) => void
  unsubscribeFromCollection: () => void
  unsubscribeFromDocument: () => void
  
  // State Management
  setItem: (item: T | null) => void
  setItems: (items: T[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

type CollectionStore<T> = CollectionState<T> & CollectionActions<T>

export function createCollectionStore<T extends DocumentData & { id: string }>(
  collectionName: string,
  transformDoc?: (doc: DocumentData & { id: string }) => T
) {
  const initialState: CollectionState<T> = {
    items: [],
    item: null,
    isLoading: false,
    error: null,
    unsubscribe: null
  }

  return create<CollectionStore<T>>()(
    devtools(
      (set, get) => ({
        ...initialState,

        create: async (data) => {
          try {
            set({ isLoading: true, error: null })
            const docRef = await addDoc(collection(db, collectionName), data as WithFieldValue<DocumentData>)
            set({ isLoading: false })
            return docRef.id
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to create document',
              isLoading: false 
            })
            throw error
          }
        },

        read: async (id) => {
          try {
            set({ isLoading: true, error: null })
            const docRef = doc(db, collectionName, id)
            const docSnap = await getDoc(docRef)
            
            if (!docSnap.exists()) {
              set({ isLoading: false, item: null })
              return null
            }

            const data = transformDoc 
              ? transformDoc({ id: docSnap.id, ...docSnap.data() })
              : { id: docSnap.id, ...docSnap.data() } as T

            set({ item: data, isLoading: false })
            return data
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to read document',
              isLoading: false 
            })
            throw error
          }
        },

        update: async (id, data) => {
          try {
            set({ isLoading: true, error: null })
            const docRef = doc(db, collectionName, id)
            await updateDoc(docRef, data as WithFieldValue<DocumentData>)
            set({ isLoading: false })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to update document',
              isLoading: false 
            })
            throw error
          }
        },

        delete: async (id) => {
          try {
            set({ isLoading: true, error: null })
            const docRef = doc(db, collectionName, id)
            await deleteDoc(docRef)
            set({ isLoading: false })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to delete document',
              isLoading: false 
            })
            throw error
          }
        },

        query: async (constraints) => {
          try {
            set({ isLoading: true, error: null })
            const q = query(collection(db, collectionName), ...constraints)
            const querySnapshot = await getDocs(q)
            
            const items = querySnapshot.docs.map(doc => 
              transformDoc 
                ? transformDoc({ id: doc.id, ...doc.data() })
                : { id: doc.id, ...doc.data() } as T
            )

            set({ items, isLoading: false })
            return items
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to query documents',
              isLoading: false 
            })
            throw error
          }
        },

        subscribeToCollection: (constraints = []) => {
          const { unsubscribe } = get()
          if (unsubscribe) {
            unsubscribe()
          }

          const q = query(collection(db, collectionName), ...constraints)
          const unsubscribeFn = onSnapshot(q, 
            (snapshot) => {
              const items = snapshot.docs.map(doc => 
                transformDoc 
                  ? transformDoc({ id: doc.id, ...doc.data() })
                  : { id: doc.id, ...doc.data() } as T
              )
              set({ items, error: null })
            },
            (error) => {
              set({ error: error.message })
            }
          )

          set({ unsubscribe: unsubscribeFn })
        },

        subscribeToDocument: (id) => {
          const { unsubscribe } = get()
          if (unsubscribe) {
            unsubscribe()
          }

          const docRef = doc(db, collectionName, id)
          const unsubscribeFn = onSnapshot(docRef,
            (doc) => {
              if (doc.exists()) {
                const data = transformDoc 
                  ? transformDoc({ id: doc.id, ...doc.data() })
                  : { id: doc.id, ...doc.data() } as T
                set({ item: data, error: null })
              } else {
                set({ item: null, error: null })
              }
            },
            (error) => {
              set({ error: error.message })
            }
          )

          set({ unsubscribe: unsubscribeFn })
        },

        unsubscribeFromCollection: () => {
          const { unsubscribe } = get()
          if (unsubscribe) {
            unsubscribe()
            set({ unsubscribe: null, items: [] })
          }
        },

        unsubscribeFromDocument: () => {
          const { unsubscribe } = get()
          if (unsubscribe) {
            unsubscribe()
            set({ unsubscribe: null, item: null })
          }
        },

        setItem: (item) => set({ item }),
        setItems: (items) => set({ items }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error })
      })
    )
  )
} 