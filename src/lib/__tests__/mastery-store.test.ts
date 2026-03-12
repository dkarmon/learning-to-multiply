// ABOUTME: Tests for the Firestore mastery loading and persistence functions.
// ABOUTME: Verifies records are fetched, converted to FactMasteryRecord, and persisted.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FactMasteryRecord } from '../../types/learning';

vi.mock('../firebase', () => ({
  db: {},
}));

const mockGetDocs = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockServerTimestamp = vi.fn(() => 'mock-timestamp');

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  where: (...args: unknown[]) => mockWhere(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

import { loadMasteryRecords, persistMasteryResult } from '../mastery-store';

describe('loadMasteryRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCollection.mockReturnValue('mastery-ref');
    mockWhere.mockReturnValue('where-clause');
    mockQuery.mockReturnValue('query-ref');
  });

  it('returns empty map when kidId is empty', async () => {
    const result = await loadMasteryRecords('');
    expect(result.size).toBe(0);
    expect(mockGetDocs).not.toHaveBeenCalled();
  });

  it('fetches mastery records and converts to FactMasteryRecord map', async () => {
    const mockDate = new Date('2025-06-01T00:00:00Z');
    const mockDocs = [
      {
        data: () => ({
          kid_id: 'kid-1',
          factor_a: 2,
          factor_b: 3,
          leitner_box: 3,
          total_attempts: 10,
          correct_attempts: 8,
          avg_response_time_ms: 2500,
          last_practiced_at: { toDate: () => mockDate },
          next_review_at: { toDate: () => mockDate },
        }),
      },
      {
        data: () => ({
          kid_id: 'kid-1',
          factor_a: 5,
          factor_b: 7,
          leitner_box: 1,
          total_attempts: 2,
          correct_attempts: 0,
          avg_response_time_ms: null,
          last_practiced_at: null,
          next_review_at: null,
        }),
      },
    ];

    mockGetDocs.mockResolvedValue({ docs: mockDocs });

    const result = await loadMasteryRecords('kid-1');

    expect(mockCollection).toHaveBeenCalledWith({}, 'mastery');
    expect(mockWhere).toHaveBeenCalledWith('kid_id', '==', 'kid-1');
    expect(result.size).toBe(2);

    const record1 = result.get('2x3');
    expect(record1).toBeDefined();
    expect(record1!.leitnerBox).toBe(3);
    expect(record1!.totalAttempts).toBe(10);
    expect(record1!.correctAttempts).toBe(8);
    expect(record1!.avgResponseTimeMs).toBe(2500);
    expect(record1!.lastPracticedAt).toEqual(mockDate);
    expect(record1!.kidId).toBe('kid-1');

    const record2 = result.get('5x7');
    expect(record2).toBeDefined();
    expect(record2!.leitnerBox).toBe(1);
    expect(record2!.lastPracticedAt).toBeNull();
  });

  it('returns empty map when Firestore query fails', async () => {
    mockGetDocs.mockRejectedValue(new Error('network error'));
    const result = await loadMasteryRecords('kid-1');
    expect(result.size).toBe(0);
  });
});

describe('persistMasteryResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.mockReturnValue('doc-ref');
    mockSetDoc.mockResolvedValue(undefined);
  });

  it('writes mastery result to Firestore with merge', async () => {
    await persistMasteryResult('kid-1', 3, 5, true, 1800);

    expect(mockDoc).toHaveBeenCalledWith({}, 'mastery', 'kid-1_3x5');
    expect(mockSetDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({
        kid_id: 'kid-1',
        factor_a: 3,
        factor_b: 5,
        last_practiced_at: 'mock-timestamp',
      }),
      { merge: true },
    );
  });

  it('does nothing when kidId is empty', async () => {
    await persistMasteryResult('', 3, 5, true, 1800);
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it('canonicalizes factors (smaller first)', async () => {
    await persistMasteryResult('kid-1', 7, 3, true, 1500);

    expect(mockDoc).toHaveBeenCalledWith({}, 'mastery', 'kid-1_3x7');
    const callArgs = mockSetDoc.mock.calls[0][1];
    expect(callArgs.factor_a).toBe(3);
    expect(callArgs.factor_b).toBe(7);
  });
});
