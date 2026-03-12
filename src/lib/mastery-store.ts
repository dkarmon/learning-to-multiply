// ABOUTME: Loads and persists fact mastery records to/from Firestore.
// ABOUTME: Provides non-hook async functions usable from both React and Phaser contexts.

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { FactMasteryRecord } from '../types/learning';
import { canonicalize, factKey } from '../types/learning';

export async function loadMasteryRecords(
  kidId: string,
): Promise<Map<string, FactMasteryRecord>> {
  const records = new Map<string, FactMasteryRecord>();
  if (!kidId) return records;

  try {
    const masteryRef = collection(db, 'mastery');
    const q = query(masteryRef, where('kid_id', '==', kidId));
    const snapshot = await getDocs(q);

    for (const d of snapshot.docs) {
      const row = d.data();
      const canonical = canonicalize(row.factor_a, row.factor_b);
      const key = factKey(canonical.factorA, canonical.factorB);
      records.set(key, {
        kidId: row.kid_id,
        factorA: canonical.factorA,
        factorB: canonical.factorB,
        leitnerBox: row.leitner_box,
        totalAttempts: row.total_attempts,
        correctAttempts: row.correct_attempts,
        avgResponseTimeMs: row.avg_response_time_ms ?? null,
        lastPracticedAt: row.last_practiced_at?.toDate?.() ?? null,
        nextReviewAt: row.next_review_at?.toDate?.() ?? null,
      });
    }
  } catch (err) {
    console.error('Failed to load mastery records:', err);
  }

  return records;
}

export async function persistMasteryResult(
  kidId: string,
  factorA: number,
  factorB: number,
  isCorrect: boolean,
  responseTimeMs: number,
): Promise<void> {
  if (!kidId) return;

  const canonical = canonicalize(factorA, factorB);
  const docId = `${kidId}_${factKey(canonical.factorA, canonical.factorB)}`;
  const docRef = doc(db, 'mastery', docId);

  await setDoc(
    docRef,
    {
      kid_id: kidId,
      factor_a: canonical.factorA,
      factor_b: canonical.factorB,
      is_correct: isCorrect,
      response_time_ms: responseTimeMs,
      last_practiced_at: serverTimestamp(),
    },
    { merge: true },
  );
}
