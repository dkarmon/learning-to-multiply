// ABOUTME: Public API barrel export for the learning engine.
// ABOUTME: Re-exports all modules for clean imports from consuming code.

export {
  promoteFact,
  demoteFact,
  isDueForReview,
  getBoxForFact,
  calculateNextReviewDate,
  processAttempt,
} from './leitner';

export {
  TIER_DEFINITIONS,
  getTierForLevel,
  getCurrentTier,
  getAvailableFacts,
  getNewFactsForTier,
  canAdvanceLevel,
  getLevelPlan,
} from './difficulty';

export {
  classifyError,
} from './error-classifier';

export {
  generateBuildUpSequence,
  shouldUseBuildUp,
} from './build-up';

export {
  scoreFluency,
  isFluentRecall,
  isCloseAnswer,
} from './fluency';

export {
  startSession,
  recordAttempt,
  getRetryFact,
  shouldSuggestBreak,
  getSessionStats,
  endSession,
} from './session';

export {
  getAllCanonicalFacts,
  getFactMastery,
  getAllMastery,
  getMasteryHeatMap,
  getStrugglingFacts,
} from './mastery';

export {
  buildLevelQuestions,
  getNextQuestion,
} from './question-selector';
