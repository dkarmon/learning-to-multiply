// ABOUTME: Tests for difficulty tier definitions and level progression logic.
// ABOUTME: Verifies tier assignment, fact generation, advancement criteria, and level planning.

import { describe, it, expect } from 'vitest';
import {
  TIER_DEFINITIONS,
  getTierForLevel,
  getCurrentTier,
  getAvailableFacts,
  getNewFactsForTier,
  canAdvanceLevel,
  getLevelPlan,
} from '../difficulty';
import { factKey } from '../../../types/learning';
import type { FactMasteryRecord } from '../../../types/learning';

describe('getTierForLevel', () => {
  it('level 1 returns tier 1', () => {
    expect(getTierForLevel(1).tier).toBe(1);
  });

  it('level 5 returns tier 2', () => {
    expect(getTierForLevel(5).tier).toBe(2);
  });

  it('level 8 returns tier 3', () => {
    expect(getTierForLevel(8).tier).toBe(3);
  });

  it('level 10 returns tier 4', () => {
    expect(getTierForLevel(10).tier).toBe(4);
  });

  it('level 15 returns tier 5', () => {
    expect(getTierForLevel(15).tier).toBe(5);
  });

  it('level 20 (beyond max) returns tier 5', () => {
    expect(getTierForLevel(20).tier).toBe(5);
  });
});

describe('getCurrentTier', () => {
  it('delegates to getTierForLevel correctly', () => {
    expect(getCurrentTier(1)).toBe(1);
    expect(getCurrentTier(5)).toBe(2);
    expect(getCurrentTier(10)).toBe(4);
  });
});

describe('getAvailableFacts', () => {
  it('level 1 returns only facts involving 0, 1, 2', () => {
    const facts = getAvailableFacts(1);
    for (const f of facts) {
      expect(
        [0, 1, 2].includes(f.factorA) || [0, 1, 2].includes(f.factorB)
      ).toBe(true);
    }
    expect(facts.length).toBeGreaterThan(0);
  });

  it('level 5 includes facts involving 0, 1, 2, 5, 10', () => {
    const facts = getAvailableFacts(5);
    const multipliers = new Set([0, 1, 2, 5, 10]);
    for (const f of facts) {
      expect(multipliers.has(f.factorA) || multipliers.has(f.factorB)).toBe(true);
    }
    // Should have more facts than level 1
    expect(facts.length).toBeGreaterThan(getAvailableFacts(1).length);
  });

  it('level 15 includes all facts up to 10x10', () => {
    const facts = getAvailableFacts(15);
    // All 66 canonical facts
    expect(facts.length).toBe(66);
  });
});

describe('getNewFactsForTier', () => {
  it('tier 1 has facts with 0, 1, 2', () => {
    const facts = getNewFactsForTier(1);
    for (const f of facts) {
      expect([0, 1, 2].includes(f.factorA) || [0, 1, 2].includes(f.factorB)).toBe(true);
    }
    expect(facts.length).toBeGreaterThan(0);
  });

  it('tier 2 excludes facts already covered by {0,1,2}', () => {
    const tier2Facts = getNewFactsForTier(2);
    const tier1Facts = getNewFactsForTier(1);
    const tier1Keys = new Set(tier1Facts.map(f => factKey(f.factorA, f.factorB)));

    for (const f of tier2Facts) {
      const key = factKey(f.factorA, f.factorB);
      expect(tier1Keys.has(key)).toBe(false);
    }
  });

  it('tier 5 has facts with 6, 7, 8 not covered by earlier tiers', () => {
    const tier5Facts = getNewFactsForTier(5);
    // Each fact should have at least one factor in [6, 7, 8]
    for (const f of tier5Facts) {
      expect([6, 7, 8].includes(f.factorA) || [6, 7, 8].includes(f.factorB)).toBe(true);
    }
    // And none should be covered by earlier tier multipliers alone
    const earlierMultipliers = new Set([0, 1, 2, 5, 10, 3, 4, 9]);
    for (const f of tier5Facts) {
      expect(earlierMultipliers.has(f.factorA) && earlierMultipliers.has(f.factorB)).toBe(false);
    }
  });
});

describe('canAdvanceLevel', () => {
  it('returns true for 5/5 correct avg 2s', () => {
    const attempts = Array.from({ length: 5 }, () => ({ isCorrect: true, responseTimeMs: 2000 }));
    expect(canAdvanceLevel(attempts)).toBe(true);
  });

  it('returns true for 4/5 correct avg 4s', () => {
    const attempts = [
      ...Array.from({ length: 4 }, () => ({ isCorrect: true, responseTimeMs: 4000 })),
      { isCorrect: false, responseTimeMs: 4000 },
    ];
    expect(canAdvanceLevel(attempts)).toBe(true);
  });

  it('returns false for 3/5 correct (accuracy too low)', () => {
    const attempts = [
      ...Array.from({ length: 3 }, () => ({ isCorrect: true, responseTimeMs: 2000 })),
      ...Array.from({ length: 2 }, () => ({ isCorrect: false, responseTimeMs: 2000 })),
    ];
    expect(canAdvanceLevel(attempts)).toBe(false);
  });

  it('returns false for 5/5 correct avg 6s (too slow)', () => {
    const attempts = Array.from({ length: 5 }, () => ({ isCorrect: true, responseTimeMs: 6000 }));
    expect(canAdvanceLevel(attempts)).toBe(false);
  });

  it('returns false for empty attempts', () => {
    expect(canAdvanceLevel([])).toBe(false);
  });
});

describe('getLevelPlan', () => {
  it('fresh kid at level 1 has all new facts and no review facts', () => {
    const records = new Map<string, FactMasteryRecord>();
    const plan = getLevelPlan(1, records);
    expect(plan.newFacts.length).toBeGreaterThan(0);
    expect(plan.reviewFacts.length).toBe(0);
    expect(plan.tier).toBe(1);
  });

  it('kid at level 4 with mastery has tier 2 new + tier 1 review', () => {
    const records = new Map<string, FactMasteryRecord>();
    // Add some mastery for tier 1 facts
    records.set('0x1', {
      kidId: 'kid1', factorA: 0, factorB: 1, leitnerBox: 3,
      totalAttempts: 5, correctAttempts: 4, avgResponseTimeMs: 1500,
      lastPracticedAt: new Date(), nextReviewAt: null,
    });
    records.set('1x2', {
      kidId: 'kid1', factorA: 1, factorB: 2, leitnerBox: 3,
      totalAttempts: 5, correctAttempts: 4, avgResponseTimeMs: 1500,
      lastPracticedAt: new Date(), nextReviewAt: null,
    });

    const plan = getLevelPlan(4, records);
    expect(plan.tier).toBe(2);
    expect(plan.newFacts.length).toBeGreaterThan(0);
    expect(plan.reviewFacts.length).toBeGreaterThan(0);
  });
});
