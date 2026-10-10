import { test } from 'node:test';
import assert from 'node:assert';

// Mock Scene helpers with toastLane definition
const Scene = {
  // Toast lane: reserved space where notification toasts and guidance render.
  // Both viewports: portrait 400x720 (logical) and landscape 720x400 (logical).
  toastLane: function() {
    // Toast lane occupies bottom 120px in portrait, scales proportionally in landscape.
    // Bottom 120px = y:600 to y:720 in portrait (400x720).
    // Landscape equivalent: y:(G.H - 120) to y:G.H where G.H = 400 (logical height).
    // Unscaled return: { x, y, w, h } in logical coordinates.
    const laneHeight = 120;
    const laneY = 720 - laneHeight; // 600 in portrait
    return {
      x: 0,
      y: laneY,
      w: 400,
      h: laneHeight
    };
  }
};

// Mock combat action area (from combatScene.js after fix)
const CombatLayout = {
  getCombatLayout: function() {
    const actionTop = 248;
    return {
      actions: { x: 8, y: actionTop, w: 384, h: 720 - actionTop }
    };
  }
};

// Mock action button grid
function getActionButtonRects(buttonCount) {
  const layout = CombatLayout.getCombatLayout();
  const { x, y, w, h } = layout.actions;
  const buttonH = 46; // standard action button height
  const gap = 8;
  const buttons = [];
  
  for (let i = 0; i < buttonCount; i++) {
    buttons.push({
      x: x + gap,
      y: y + gap + i * (buttonH + gap),
      w: w - 2 * gap,
      h: buttonH
    });
  }
  return buttons;
}

// Helper: check if two rectangles overlap
function rectsOverlap(rect1, rect2) {
  const r1Bottom = rect1.y + rect1.h;
  const r2Bottom = rect2.y + rect2.h;
  const r1Right = rect1.x + rect1.w;
  const r2Right = rect2.x + rect2.w;
  
  return !(r1Bottom <= rect2.y || r2Bottom <= rect1.y || 
           r1Right <= rect2.x || r2Right <= rect1.x);
}

test('toast lane does not overlap with action buttons', (t) => {
  const buttonCounts = [2, 4, 6, 8]; // typical combat action counts
  const toastLane = Scene.toastLane();
  
  buttonCounts.forEach(count => {
    t.test(`no overlap with ${count} action buttons`, () => {
      const buttons = getActionButtonRects(count);
      buttons.forEach((btn, idx) => {
        const overlap = rectsOverlap(btn, toastLane);
        assert.strictEqual(
          overlap,
          false,
          `Action button ${idx} overlaps toast lane`
        );
      });
    });
  });
});

test('toast lane reserved height is sufficient for dual-line guidance', (t) => {
  const toastLane = Scene.toastLane();
  
  // Guidance toast typical height: 2 lines @ 14px font + padding = ~40px
  const guidanceHeight = 40;
  // Up to 2 concurrent guidance toasts: 40px + 8px gap = ~88px
  // Should fit in 120px lane with margin
  
  t.test('lane height accommodates stacked guidance', () => {
    const requiredHeight = 40 * 2 + 8; // 2 toasts + gap
    assert.ok(
      toastLane.h >= requiredHeight,
      `Toast lane height ${toastLane.h}px insufficient for ${requiredHeight}px (2 stacked guidance toasts)`
    );
  });
  
  t.test('lane height allows margin above bottom edge', () => {
    const targetMargin = 10; // px from screen bottom
    assert.ok(
      toastLane.h >= targetMargin,
      `Toast lane height too small to maintain ${targetMargin}px bottom margin`
    );
  });
});

test('toast lane bottom does not exceed viewport', (t) => {
  const toastLane = Scene.toastLane();
  const viewportHeight = 720; // portrait logical height
  
  t.test('lane bottom is within viewport', () => {
    const laneBottom = toastLane.y + toastLane.h;
    assert.ok(
      laneBottom <= viewportHeight,
      `Toast lane extends beyond viewport: y:${toastLane.y}, h:${toastLane.h}, bottom:${laneBottom} > ${viewportHeight}`
    );
  });
});
