// ABOUTME: Difficulty tier definitions and level progression logic.
// ABOUTME: Controls which facts are available at each level and when advancement happens.

import type {
  CanonicalFact,
  DifficultyTier,
  TierDefinition,
  FactMasteryRecord,
} from '../../types/learning';
import { canonicalize, factKey } from '../../types/learning';

export const TIER_DEFINITIONS: TierDefinition[] = [
  { tier: 1, multipliers: [0, 1, 2],    levels: [1, 3],   label: 'Zero, One, Doubles' },
  { tier: 2, multipliers: [5, 10],       levels: [4, 5],   label: 'Fives and Tens' },
  { tier: 3, multipliers: [3, 4],        levels: [6, 8],   label: 'Threes and Fours' },
  { tier: 4, multipliers: [9],           levels: [9, 10],  label: 'Nines' },
  { tier: 5, multipliers: [6, 7, 8],     levels: [11, 15], label: 'Hard Facts' },
];

const ALL_FACTORS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function getTierForLevel(level: number): TierDefinition {
  for (const tier of TIER_DEFINITIONS) {
    if (level >= tier.levels[0] && level <= tier.levels[1]) {
      return tier;
    }
  }
  return TIER_DEFINITIONS[TIER_DEFINITIONS.length - 1];
}

export function getCurrentTier(currentLevel: number): DifficultyTier {
  return getTierForLevel(currentLevel).tier;
}

export function getAvailableFacts(level: number): CanonicalFact[] {
  const currentTier = getTierForLevel(level);

  const allAvailableMultipliers = new Set<number>();
  for (const tier of TIER_DEFINITIONS) {
    if (tier.tier <= currentTier.tier) {
      for (const m of tier.multipliers) {
        allAvailableMultipliers.add(m);
      }
    }
  }

  const facts: CanonicalFact[] = [];
  const seen = new Set<string>();

  for (const a of ALL_FACTORS) {
    for (const b of ALL_FACTORS) {
      if (a > b) continue;
      if (!allAvailableMultipliers.has(a) && !allAvailableMultipliers.has(b)) continue;
      const key = factKey(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      facts.push(canonicalize(a, b));
    }
  }

  return facts;
}

export function getNewFactsForTier(tier: DifficultyTier): CanonicalFact[] {
  const tierDef = TIER_DEFINITIONS.find(t => t.tier === tier);
  if (!tierDef) return [];

  const previousMultipliers = new Set<number>();
  for (const t of TIER_DEFINITIONS) {
    if (t.tier < tier) {
      for (const m of t.multipliers) {
        previousMultipliers.add(m);
      }
    }
  }

  const currentMultipliers = new Set(tierDef.multipliers);
  const facts: CanonicalFact[] = [];
  const seen = new Set<string>();

  for (const a of ALL_FACTORS) {
    for (const b of ALL_FACTORS) {
      if (a > b) continue;
      if (!currentMultipliers.has(a) && !currentMultipliers.has(b)) continue;
      if (previousMultipliers.has(a) || previousMultipliers.has(b)) continue;
      const key = factKey(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      facts.push(canonicalize(a, b));
    }
  }

  return facts;
}

export function canAdvanceLevel(
  levelAttempts: { isCorrect: boolean; responseTimeMs: number }[]
): boolean {
  if (levelAttempts.length === 0) return false;

  const correct = levelAttempts.filter(a => a.isCorrect).length;
  const accuracy = correct / levelAttempts.length;

  const avgResponseTime =
    levelAttempts.reduce((sum, a) => sum + a.responseTimeMs, 0) / levelAttempts.length;

  return accuracy >= 0.8 && avgResponseTime < 5000;
}

export function getLevelPlan(
  level: number,
  masteryRecords: Map<string, FactMasteryRecord>
): { newFacts: CanonicalFact[]; reviewFacts: CanonicalFact[]; tier: DifficultyTier } {
  const tierDef = getTierForLevel(level);
  const newFactsForTier = getNewFactsForTier(tierDef.tier);
  const allAvailableFacts = getAvailableFacts(level);

  const newFacts = newFactsForTier.filter(f => {
    const key = factKey(f.factorA, f.factorB);
    const record = masteryRecords.get(key);
    if (!record) return true;
    return record.leitnerBox < 4;
  });

  const newFactKeys = new Set(newFacts.map(f => factKey(f.factorA, f.factorB)));
  const reviewFacts = allAvailableFacts.filter(f => {
    const key = factKey(f.factorA, f.factorB);
    if (newFactKeys.has(key)) return false;
    const record = masteryRecords.get(key);
    return record !== undefined && record.totalAttempts > 0;
  });

  return { newFacts, reviewFacts, tier: tierDef.tier };
}
