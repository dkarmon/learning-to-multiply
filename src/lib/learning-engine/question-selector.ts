// ABOUTME: Selects and orders questions for each level based on mastery, review priority, and variety.
// ABOUTME: Builds levels with 60% new facts + 40% review, interleaved, never repeating consecutively.

import type {
  Question,
  LevelPlan,
  CanonicalFact,
  FactMasteryRecord,
  SessionState,
} from '../../types/learning';
import { factKey } from '../../types/learning';
import { getLevelPlan, getTierForLevel } from './difficulty';
import { isDueForReview, getBoxForFact } from './leitner';
import { getRetryFact } from './session';
import { shouldUseBuildUp, generateBuildUpSequence } from './build-up';

const QUESTIONS_PER_LEVEL = 5;
const NEW_RATIO = 0.6;

export function buildLevelQuestions(
  level: number,
  masteryRecords: Map<string, FactMasteryRecord>,
  session: SessionState,
  currentSessionNumber: number,
  lastReviewedSessions: Map<string, number>
): LevelPlan {
  const { newFacts, reviewFacts, tier } = getLevelPlan(level, masteryRecords);

  const newCount = Math.round(QUESTIONS_PER_LEVEL * NEW_RATIO);
  const reviewCount = QUESTIONS_PER_LEVEL - newCount;

  const dueReviewFacts = reviewFacts.filter(f => {
    const key = factKey(f.factorA, f.factorB);
    const record = masteryRecords.get(key);
    if (!record) return false;
    const lastSession = lastReviewedSessions.get(key) ?? 0;
    return isDueForReview(record, currentSessionNumber, lastSession);
  });

  const recentlyFailed: CanonicalFact[] = [];
  for (const key of session.missedThisSession) {
    const [aStr, bStr] = key.split('x');
    recentlyFailed.push({ factorA: parseInt(aStr), factorB: parseInt(bStr) });
  }

  const lowMastery = [...newFacts, ...reviewFacts].filter(f => {
    const key = factKey(f.factorA, f.factorB);
    const record = masteryRecords.get(key);
    if (!record) return false;
    return record.leitnerBox <= 2 && record.totalAttempts > 0;
  });

  const trulyNew = newFacts.filter(f => {
    const key = factKey(f.factorA, f.factorB);
    const record = masteryRecords.get(key);
    return !record || record.totalAttempts === 0;
  });

  const selected: CanonicalFact[] = [];
  const selectedKeys = new Set<string>();

  function addFact(fact: CanonicalFact): boolean {
    const key = factKey(fact.factorA, fact.factorB);
    if (selectedKeys.has(key)) return false;
    selected.push(fact);
    selectedKeys.add(key);
    return true;
  }

  let reviewFilled = 0;
  for (const f of shuffleArray(dueReviewFacts)) {
    if (reviewFilled >= reviewCount) break;
    if (addFact(f)) reviewFilled++;
  }

  for (const f of recentlyFailed) {
    if (reviewFilled >= reviewCount) break;
    if (addFact(f)) reviewFilled++;
  }

  for (const f of shuffleArray(lowMastery)) {
    if (selected.length >= QUESTIONS_PER_LEVEL) break;
    addFact(f);
  }

  if (trulyNew.length > 0 && selected.length < QUESTIONS_PER_LEVEL) {
    const newFact = trulyNew[Math.floor(Math.random() * trulyNew.length)];
    addFact(newFact);
  }

  const allAvailable = [...reviewFacts, ...newFacts];
  const shuffled = shuffleArray(allAvailable);
  for (const f of shuffled) {
    if (selected.length >= QUESTIONS_PER_LEVEL) break;
    addFact(f);
  }

  const questions: Question[] = selected.map(f => {
    const key = factKey(f.factorA, f.factorB);
    const box = getBoxForFact(masteryRecords, key);
    const isNew = trulyNew.some(
      nf => factKey(nf.factorA, nf.factorB) === key
    );

    const [presentA, presentB] = Math.random() < 0.5
      ? [f.factorA, f.factorB]
      : [f.factorB, f.factorA];

    return {
      factorA: presentA,
      factorB: presentB,
      correctAnswer: presentA * presentB,
      isBuildingUp: false,
      buildUpSequenceIndex: 0,
      isReview: !isNew,
      leitnerBox: box,
    };
  });

  const interleaved = interleaveQuestions(questions);

  return {
    levelNumber: level,
    questions: interleaved,
    tier,
    reviewRatio: reviewFilled / Math.max(selected.length, 1),
  };
}

function interleaveQuestions(questions: Question[]): Question[] {
  if (questions.length <= 1) return questions;

  const newQs = questions.filter(q => !q.isReview);
  const reviewQs = questions.filter(q => q.isReview);

  const result: Question[] = [];
  let ni = 0;
  let ri = 0;

  while (ni < newQs.length || ri < reviewQs.length) {
    if (ni < newQs.length) {
      result.push(newQs[ni++]);
    }
    if (ri < reviewQs.length) {
      result.push(reviewQs[ri++]);
    }
  }

  return deduplicateConsecutive(result);
}

function deduplicateConsecutive(questions: Question[]): Question[] {
  const result = [...questions];

  for (let i = 1; i < result.length; i++) {
    const prevKey = factKey(result[i - 1].factorA, result[i - 1].factorB);
    const currKey = factKey(result[i].factorA, result[i].factorB);

    if (prevKey === currKey) {
      for (let j = i + 1; j < result.length; j++) {
        const jKey = factKey(result[j].factorA, result[j].factorB);
        if (jKey !== prevKey) {
          [result[i], result[j]] = [result[j], result[i]];
          break;
        }
      }
    }
  }

  return result;
}

export function getNextQuestion(
  levelPlan: LevelPlan,
  questionIndex: number,
  session: SessionState,
  masteryRecords: Map<string, FactMasteryRecord>
): { question: Question; isRetry: boolean; buildUpSequence: Question[] | null } {
  const { fact: retryFact } = getRetryFact(session);
  if (retryFact) {
    const box = getBoxForFact(
      masteryRecords,
      factKey(retryFact.factorA, retryFact.factorB)
    );

    return {
      question: {
        factorA: retryFact.factorA,
        factorB: retryFact.factorB,
        correctAnswer: retryFact.factorA * retryFact.factorB,
        isBuildingUp: false,
        buildUpSequenceIndex: 0,
        isReview: true,
        leitnerBox: box,
      },
      isRetry: true,
      buildUpSequence: null,
    };
  }

  if (questionIndex >= levelPlan.questions.length) {
    const lastQ = levelPlan.questions[levelPlan.questions.length - 1];
    return { question: lastQ, isRetry: false, buildUpSequence: null };
  }

  const question = levelPlan.questions[questionIndex];

  if (!question.isReview && shouldUseBuildUp(question.factorA, question.factorB, masteryRecords)) {
    const sequence = generateBuildUpSequence(
      question.factorA,
      question.factorB,
      masteryRecords
    );

    const buildUpQuestions: Question[] = sequence.steps
      .filter(step => step.isQuestion)
      .map((step, idx) => ({
        factorA: step.factorA,
        factorB: step.factorB,
        correctAnswer: step.correctAnswer,
        isBuildingUp: true,
        buildUpSequenceIndex: idx,
        isReview: false,
        leitnerBox: getBoxForFact(masteryRecords, factKey(step.factorA, step.factorB)),
      }));

    return {
      question,
      isRetry: false,
      buildUpSequence: buildUpQuestions.length > 1 ? buildUpQuestions : null,
    };
  }

  return { question, isRetry: false, buildUpSequence: null };
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
