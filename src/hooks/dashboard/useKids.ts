// ABOUTME: Hook for managing kid profiles with full CRUD operations.
// ABOUTME: Extends the auth store's basic kid list with edit, delete, and avatar updates.

import { useState, useCallback } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../stores/auth';
import type { KidProfile } from '../../types';

interface UseKidsReturn {
  kids: KidProfile[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addKid: (name: string, avatarUrl: string | null) => Promise<KidProfile | null>;
  updateKid: (id: string, updates: { name?: string; avatarUrl?: string | null }) => Promise<boolean>;
  deleteKid: (id: string) => Promise<boolean>;
}

export function useKids(): UseKidsReturn {
  const { user, kids, fetchKids } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchKids();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch kids');
    } finally {
      setLoading(false);
    }
  }, [fetchKids]);

  const addKid = useCallback(async (name: string, avatarUrl: string | null): Promise<KidProfile | null> => {
    if (!user) return null;
    setError(null);

    try {
      const kidsRef = collection(db, 'kids');
      const docRef = await addDoc(kidsRef, {
        parent_id: user.uid,
        name,
        avatar_url: avatarUrl,
        created_at: serverTimestamp(),
      });

      await fetchKids();

      return {
        id: docRef.id,
        parentId: user.uid,
        name,
        avatarUrl,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add kid');
      return null;
    }
  }, [user, fetchKids]);

  const updateKid = useCallback(async (
    id: string,
    updates: { name?: string; avatarUrl?: string | null }
  ): Promise<boolean> => {
    setError(null);

    const dbUpdates: Record<string, string | null> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

    try {
      const kidRef = doc(db, 'kids', id);
      await updateDoc(kidRef, dbUpdates);
      await fetchKids();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update kid');
      return false;
    }
  }, [fetchKids]);

  const deleteKid = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const kidRef = doc(db, 'kids', id);
      await deleteDoc(kidRef);
      await fetchKids();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete kid');
      return false;
    }
  }, [fetchKids]);

  return { kids, loading, error, refresh, addKid, updateKid, deleteKid };
}
