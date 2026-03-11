// ABOUTME: Constants for the manipulatives visual math system.
// ABOUTME: Sizes, colors, snap thresholds, and layout dimensions.

export const MANIP = {
  // Piece dimensions
  CIRCLE_RADIUS: 12,
  CIRCLE_DIAMETER: 24,
  RECT_WIDTH: 120,   // 5 * 24 = 120
  RECT_HEIGHT: 24,

  // Colors
  CIRCLE_COLOR: 0x2196F3,      // Blue
  CIRCLE_STROKE: 0x1976D2,
  RECT_COLOR: 0xFF9800,         // Orange
  RECT_STROKE: 0xF57C00,
  RECT_DIVIDER: 0xFFCC80,       // Light orange for 5-dot dividers
  GHOST_COLOR: 0xCCCCCC,
  GHOST_ALPHA: 0.35,
  HIGHLIGHT_COLOR: 0xFFEB3B,    // Yellow highlight during count animation
  GROUP_OUTLINE_COLOR: 0x666666,
  WORKSPACE_BG: 0xFAFAFA,
  TRAY_BG: 0xEEEEEE,
  BACKDROP_COLOR: 0x000000,
  BACKDROP_ALPHA: 0.3,

  // Layout
  TRAY_WIDTH: 130,
  CELL_SIZE: 28,
  CELL_GAP: 2,
  SNAP_THRESHOLD: 20,          // Snap within 20px
  GROUP_PADDING: 6,
  GROUP_VERTICAL_GAP: 12,

  // Animation
  DRAG_SCALE: 1.1,
  SNAP_DURATION: 120,          // ms
  COUNT_STEP_DELAY: 400,       // ms between count steps
  HINT_FADE_DURATION: 300,
  CELEBRATION_DURATION: 1500,

  // Touch
  GRAB_PADDING: 8,             // Extra hit area around pieces

  // Text
  TOTAL_FONT_SIZE: '20px',
  TOTAL_FONT_FAMILY: 'Arial, sans-serif',
  GROUP_LABEL_FONT_SIZE: '13px',
  DECOMPOSITION_FONT_SIZE: '16px',
} as const;
