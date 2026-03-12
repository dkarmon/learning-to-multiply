// ABOUTME: Authentication store managing parent session and active kid profile.
// ABOUTME: Persists active kid selection to localStorage for session continuity.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from 'firebase/auth';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { KidProfile } from '../types';
import { auth, db, googleProvider } from '../lib/firebase';

interface AuthState {
  user: User | null;
  kids: KidProfile[];
  activeKid: KidProfile | null;
  loading: boolean;

  setUser: (user: User | null) => void;
  setActiveKid: (kid: KidProfile | null) => void;
  fetchKids: () => Promise<void>;
  addKid: (name: string) => Promise<KidProfile | null>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      kids: [],
      activeKid: null,
      loading: true,

      setUser: (user) => {
        set({
          user,
          loading: false,
        });
      },

      setActiveKid: (kid) => {
        set({ activeKid: kid });
      },

      fetchKids: async () => {
        const user = get().user;
        if (!user) return;

        const kidsRef = collection(db, 'kids');
        const q = query(
          kidsRef,
          where('parent_id', '==', user.uid),
          orderBy('created_at', 'asc')
        );

        try {
          const snapshot = await getDocs(q);
          const kids: KidProfile[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              parentId: data.parent_id,
              name: data.name,
              avatarUrl: data.avatar_url ?? null,
              createdAt: data.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
            };
          });

          set({ kids });

          const activeKid = get().activeKid;
          if (activeKid && !kids.find((k) => k.id === activeKid.id)) {
            set({ activeKid: null });
          }
        } catch (error) {
          console.error('Failed to fetch kids:', error);
        }
      },

      addKid: async (name: string) => {
        const user = get().user;
        if (!user) return null;

        try {
          const kidsRef = collection(db, 'kids');
          const docRef = await addDoc(kidsRef, {
            parent_id: user.uid,
            name,
            avatar_url: null,
            created_at: serverTimestamp(),
          });

          const kid: KidProfile = {
            id: docRef.id,
            parentId: user.uid,
            name,
            avatarUrl: null,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({ kids: [...state.kids, kid] }));
          return kid;
        } catch (error) {
          console.error('Failed to add kid:', error);
          return null;
        }
      },

      signInWithGoogle: async () => {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;

          const parentRef = doc(db, 'parents', user.uid);
          await setDoc(parentRef, {
            display_name: user.displayName,
            created_at: serverTimestamp(),
          }, { merge: true });
        } catch (error) {
          console.error('Google sign-in failed:', error);
        }
      },

      signOut: async () => {
        await firebaseSignOut(auth);
        set({
          user: null,
          kids: [],
          activeKid: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ activeKid: state.activeKid }),
    }
  )
);
