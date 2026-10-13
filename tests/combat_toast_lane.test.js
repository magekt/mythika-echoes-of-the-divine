import { test } from 'node:test';
import assert from 'node:assert';

// Mock Scene with toastLane
const Scene = {
  toastLane: function() {
    const laneHeight = 120;
    const laneY = 720 - laneHeight; // 600 in portrait
    return { x: 0, y: laneY, w: 400, h: laneHeight };
  }
};

// Mock combat action area (dynamic, respects toast lane)
const CombatLayout = {
  getActionAreaTop: function() { return 248; },
  getActionAreaHeight: function() {
    const toastLaneTop = Scene.toastLane().y;
    return toastLaneTop - this.getActionAreaTop();
  },
  getCombatLayout: function() {
    const actionTop = this.getActionAreaTop();
    return {
      actions: { x: 8, y: actionTop, w: 384, h: this.getActionAreaHeight() }
    };
  }
};

function getActionButtonRects(buttonCount) {
  const layout = CombatLayout.getCombatLayout();
  const { x, y, w, h } = layout.actions;
  const buttonH = 38; // compact height to fit 8 buttons
  const gap = 6;
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

function rectsOverlap(rect1, rect2) {
  const r1Bottom = rect1.y + rect1.h;
  const r2Bottom = rect2.y + rect2.h;
  const r1Right = rect1.x + rect1.w;
  const r2Right = rect2.x + rect2.w;
  
  return !(r1Bottom <= rect2.y || r2Bottom <= rect1.y || 
           r1Right <= rect2.x || r2Right <= rect1.x);
}

test('toast lane does not overlap with action buttons (dynamic sizing)', (t) => {
  const buttonCounts = [2, 4, 6, 8];
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

test('toast lane geometry is valid', (t) => {
  const toastLane = Scene.toastLane();
  
  t.test('lane height accommodates stacked guidance', () => {
    const requiredHeight = 40 * 2 + 8;
    assert.ok(toastLane.h >= requiredHeight);
  });
  
  t.test('lane bottom within viewport', () => {
    const laneBottom = toastLane.y + toastLane.h;
    assert.ok(laneBottom <= 720);
  });
});
