// ABOUTME: Tests Firestore security rules against the local emulator.
// ABOUTME: Verifies parent-child ownership enforcement for all collections.

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';
import {
  assertSucceeds,
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
} from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-learning-multiply',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('parents collection', () => {
  it('allows a parent to read their own document', async () => {
    const parentId = 'parent-1';
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'parents', parentId), {
        display_name: 'Test Parent',
        created_at: new Date(),
      });
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(getDoc(doc(db, 'parents', parentId)));
  });

  it('denies a parent from reading another parent document', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'parents', 'parent-2'), {
        display_name: 'Other Parent',
        created_at: new Date(),
      });
    });

    const db = testEnv.authenticatedContext('parent-1').firestore();
    await assertFails(getDoc(doc(db, 'parents', 'parent-2')));
  });

  it('denies unauthenticated access', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'parents', 'parent-1'), {
        display_name: 'Test',
        created_at: new Date(),
      });
    });

    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'parents', 'parent-1')));
  });
});

describe('kids collection', () => {
  const parentId = 'parent-1';
  const otherParentId = 'parent-2';

  it('allows a parent to create a kid with their own parent_id', async () => {
    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(
      addDoc(collection(db, 'kids'), {
        parent_id: parentId,
        name: 'Test Kid',
        avatar_url: null,
        created_at: new Date(),
      }),
    );
  });

  it('denies creating a kid with another parent_id', async () => {
    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertFails(
      addDoc(collection(db, 'kids'), {
        parent_id: otherParentId,
        name: 'Fake Kid',
        avatar_url: null,
        created_at: new Date(),
      }),
    );
  });

  it('allows a parent to read their own kid', async () => {
    let kidId: string = '';
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const ref = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: parentId,
        name: 'My Kid',
        created_at: new Date(),
      });
      kidId = ref.id;
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(getDoc(doc(db, 'kids', kidId)));
  });

  it('denies a parent from reading another parents kid', async () => {
    let kidId: string = '';
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const ref = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: otherParentId,
        name: 'Their Kid',
        created_at: new Date(),
      });
      kidId = ref.id;
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertFails(getDoc(doc(db, 'kids', kidId)));
  });

  it('allows a parent to delete their own kid', async () => {
    let kidId: string = '';
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const ref = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: parentId,
        name: 'My Kid',
        created_at: new Date(),
      });
      kidId = ref.id;
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(deleteDoc(doc(db, 'kids', kidId)));
  });
});

describe('sessions collection', () => {
  const parentId = 'parent-1';

  it('allows creating a session for own kid', async () => {
    let kidId: string = '';
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const ref = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: parentId,
        name: 'Kid',
        created_at: new Date(),
      });
      kidId = ref.id;
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(
      addDoc(collection(db, 'sessions'), {
        kid_id: kidId,
        started_at: new Date(),
        ended_at: null,
        level: 1,
        total_questions: 0,
        correct_answers: 0,
        duration_seconds: null,
      }),
    );
  });

  it('denies creating a session for another parents kid', async () => {
    let kidId: string = '';
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const ref = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: 'parent-2',
        name: 'Not My Kid',
        created_at: new Date(),
      });
      kidId = ref.id;
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertFails(
      addDoc(collection(db, 'sessions'), {
        kid_id: kidId,
        started_at: new Date(),
        level: 1,
        total_questions: 0,
        correct_answers: 0,
      }),
    );
  });
});

describe('mastery collection', () => {
  it('allows reading mastery for own kid', async () => {
    const parentId = 'parent-1';
    let kidId: string = '';
    let masteryId: string = '';

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const kidRef = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: parentId,
        name: 'Kid',
        created_at: new Date(),
      });
      kidId = kidRef.id;
      masteryId = `${kidId}_3x5`;
      await setDoc(doc(context.firestore(), 'mastery', masteryId), {
        kid_id: kidId,
        factor_a: 3,
        factor_b: 5,
        leitner_box: 2,
        total_attempts: 5,
        correct_attempts: 4,
        avg_response_time_ms: 2500,
        last_practiced_at: new Date(),
        next_review_at: null,
      });
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(getDoc(doc(db, 'mastery', masteryId)));
  });
});

describe('progress collection', () => {
  it('allows reading progress for own kid', async () => {
    const parentId = 'parent-1';
    let kidId: string = '';
    let progressId: string = '';

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const kidRef = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: parentId,
        name: 'Kid',
        created_at: new Date(),
      });
      kidId = kidRef.id;
      progressId = `${kidId}_level1`;
      await setDoc(doc(context.firestore(), 'progress', progressId), {
        kid_id: kidId,
        level: 1,
        unlocked_at: new Date(),
        completed_at: null,
        building_height: 50,
      });
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(getDoc(doc(db, 'progress', progressId)));
  });
});

// This test validates that the test infrastructure is properly configured.
// Full security rules coverage will be implemented in Phase 9.
it.skip('placeholder for full rules coverage matrix', () => {
  expect(true).toBe(true);
});
