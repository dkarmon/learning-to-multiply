// ABOUTME: Tests for authentication state store.
// ABOUTME: Validates state transitions for user auth, kid selection, and sign-out.

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/firebase', () => ({
  auth: {},
  db: {},
  googleProvider: {},
}));

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));

import { useAuthStore } from '../auth';
import type { User } from 'firebase/auth';
import type { KidProfile } from '../../types';

const mockUser = { uid: 'parent-1', displayName: 'Test' } as User;

const mockKid: KidProfile = {
  id: 'kid-1',
  parentId: 'parent-1',
  name: 'Noa',
  avatarUrl: null,
  createdAt: '2025-01-01T00:00:00.000Z',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      kids: [],
      activeKid: null,
      loading: true,
    });
  });

  it('starts in loading state with no user', () => {
    const state = useAuthStore.getState();
    expect(state.loading).toBe(true);
    expect(state.user).toBeNull();
    expect(state.kids).toHaveLength(0);
    expect(state.activeKid).toBeNull();
  });

  it('sets user and stops loading', () => {
    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toBe(mockUser);
    expect(state.loading).toBe(false);
  });

  it('sets user to null (signed out)', () => {
    useAuthStore.getState().setUser(null);

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('sets active kid', () => {
    useAuthStore.getState().setActiveKid(mockKid);
    expect(useAuthStore.getState().activeKid).toEqual(mockKid);
  });

  it('clears active kid', () => {
    useAuthStore.getState().setActiveKid(mockKid);
    useAuthStore.getState().setActiveKid(null);
    expect(useAuthStore.getState().activeKid).toBeNull();
  });

  it('sign out clears all state', async () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.setState({ kids: [mockKid] });
    useAuthStore.getState().setActiveKid(mockKid);

    await useAuthStore.getState().signOut();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.kids).toHaveLength(0);
    expect(state.activeKid).toBeNull();
  });
});
