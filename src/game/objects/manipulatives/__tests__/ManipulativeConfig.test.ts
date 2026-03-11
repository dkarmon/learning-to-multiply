// ABOUTME: Unit tests for ManipulativeConfig constants.
// ABOUTME: Validates key dimensional relationships between pieces.

import { describe, it, expect } from 'vitest';
import { MANIP } from '../ManipulativeConfig';

describe('ManipulativeConfig', () => {
  it('RECT_WIDTH equals CIRCLE_DIAMETER * 5', () => {
    expect(MANIP.RECT_WIDTH).toBe(MANIP.CIRCLE_DIAMETER * 5);
  });

  it('CIRCLE_DIAMETER equals CIRCLE_RADIUS * 2', () => {
    expect(MANIP.CIRCLE_DIAMETER).toBe(MANIP.CIRCLE_RADIUS * 2);
  });

  it('RECT_HEIGHT equals CIRCLE_DIAMETER', () => {
    expect(MANIP.RECT_HEIGHT).toBe(MANIP.CIRCLE_DIAMETER);
  });
});
