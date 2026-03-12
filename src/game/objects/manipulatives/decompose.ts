// ABOUTME: Pure math functions for decomposing numbers into 5-unit and 1-unit pieces.
// ABOUTME: No Phaser dependency; used by CompositeGroup and unit tests.

export interface Decomposition {
  fives: number;
  ones: number;
}

export function decompose(n: number): Decomposition {
  return {
    fives: Math.floor(n / 5),
    ones: n % 5,
  };
}

export function widthInCells(decomp: Decomposition): number {
  return decomp.fives * 5 + decomp.ones;
}
