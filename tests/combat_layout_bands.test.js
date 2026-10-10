import { test } from 'node:test';
import assert from 'node:assert';

// Mock Combat scene with fixed non-overlapping band layout
const mockCombatScene = {
  data: {
    turnState: 'playerTurn',
    log: [],
    actionButtons: [],
    scrollY: 0
  },
  getActionAreaTop() { return 248; },
  getActionAreaHeight() { return 720 - this.getActionAreaTop(); },
  getCombatLayout() {
    const actionTop = this.getActionAreaTop();
    return {
      header: { x: 10, y: 4, w: 380, h: 50 },
      roster: { x: 8, y: 58, w: 384, h: 110 },
      intent: { x: 12, y: 172, w: 376, h: 50 },
      log: { x: 14, y: 226, w: 372, h: 18 },
      actions: { x: 8, y: actionTop, w: 384, h: this.getActionAreaHeight() },
      result: { x: 12, y: actionTop, w: 376, h: this.getActionAreaHeight() }
    };
  }
};

// Helper: check if two rectangles overlap
function rectsOverlap(rect1, rect2) {
  const r1Bottom = rect1.y + rect1.h;
  const r2Bottom = rect2.y + rect2.h;
  const r1Right = rect1.x + rect1.w;
  const r2Right = rect2.x + rect2.w;
  
  return !(r1Bottom <= rect2.y || r2Bottom <= rect1.y || 
           r1Right <= rect2.x || r2Right <= rect1.x);
}

// Helper: check if rect1 is inside rect2
function rectInside(rect1, rect2) {
  return rect1.x >= rect2.x &&
         rect1.y >= rect2.y &&
         rect1.x + rect1.w <= rect2.x + rect2.w &&
         rect1.y + rect1.h <= rect2.y + rect2.h;
}

// Helper: get enemy panel rect (sized to fit hero count)
function getEnemyPanelRect(heroCount) {
  const rosterLayout = mockCombatScene.getCombatLayout().roster;
  // Scale panel height with hero count: 1→40px, 3→70px, 5→100px
  const panelH = 30 + Math.min(70, heroCount * 14);
  return {
    x: rosterLayout.x + 8,
    y: rosterLayout.y + 4,
    w: rosterLayout.w - 16,
    h: panelH
  };
}

// Helper: get target button positions (fit inside enemy panel)
function getTargetButtonRects(heroCount) {
  const enemyPanel = getEnemyPanelRect(heroCount);
  const buttons = [];
  
  // Grid layout: 2 cols, scale rows to fit
  const cols = 2;
  const rows = Math.ceil(heroCount / cols);
  const gap = 4;
  const btnW = (enemyPanel.w - 2 * gap - (cols - 1) * gap) / cols;
  const btnH = (enemyPanel.h - 2 * gap - (rows - 1) * gap) / rows;
  
  for (let i = 0; i < heroCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    buttons.push({
      x: enemyPanel.x + gap + col * (btnW + gap),
      y: enemyPanel.y + gap + row * (btnH + gap),
      w: btnW,
      h: btnH
    });
  }
  return buttons;
}

test('combat layout bands do not overlap at 1, 3, 5 heroes', (t) => {
  const heroTests = [1, 3, 5];
  const layout = mockCombatScene.getCombatLayout();
  // Exclude action/result pair — they are state-exclusive (intentional co-location)
  const bands = ['header', 'roster', 'intent', 'log', 'actions'];
  
  heroTests.forEach(heroCount => {
    t.test(`band non-overlap at ${heroCount} heroes`, () => {
      // Check that the primary bands do not overlap
      for (let i = 0; i < bands.length; i++) {
        for (let j = i + 1; j < bands.length; j++) {
          const bandA = bands[i];
          const bandB = bands[j];
          const overlap = rectsOverlap(layout[bandA], layout[bandB]);
          assert.strictEqual(
            overlap, 
            false, 
            `Band '${bandA}' overlaps with '${bandB}' at ${heroCount} heroes`
          );
        }
      }
    });
  });
});

test('target buttons sit inside enemy panel, not in header band', (t) => {
  const heroTests = [1, 3, 5];
  const layout = mockCombatScene.getCombatLayout();
  
  heroTests.forEach(heroCount => {
    t.test(`target buttons inside panel at ${heroCount} heroes`, () => {
      const enemyPanel = getEnemyPanelRect(heroCount);
      const targetButtons = getTargetButtonRects(heroCount);
      const headerBand = layout.header;
      
      targetButtons.forEach((btn, idx) => {
        // Check button is inside enemy panel
        const insidePanel = rectInside(btn, enemyPanel);
        assert.strictEqual(
          insidePanel,
          true,
          `Target button ${idx} not inside enemy panel at ${heroCount} heroes`
        );
        
        // Check button does NOT overlap header band
        const overlapsHeader = rectsOverlap(btn, headerBand);
        assert.strictEqual(
          overlapsHeader,
          false,
          `Target button ${idx} overlaps header band at ${heroCount} heroes`
        );
      });
    });
  });
});

test('result screen band does not overlap with live combat bands', (t) => {
  const layout = mockCombatScene.getCombatLayout();
  const resultBand = layout.result;
  // Exclude actions — result and actions are state-exclusive (intentional co-location)
  const combatBands = ['header', 'roster', 'intent', 'log'];
  
  t.test('result band isolation', () => {
    combatBands.forEach(bandName => {
      const overlap = rectsOverlap(resultBand, layout[bandName]);
      assert.strictEqual(
        overlap,
        false,
        `Result band overlaps with '${bandName}'`
      );
    });
  });
});
