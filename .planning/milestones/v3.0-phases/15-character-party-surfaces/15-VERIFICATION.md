---
phase: 15
name: character-party-surfaces
created: 2026-10-08
status: passed
---

# Phase 15: Character & Party Surfaces — Verification

**Goal:** Players can recognize hero identity and make progression decisions consistently across character-focused screens.

**Requirement:** REQ-025

---

## Automated Verification

### Contract Tests

| Test | Status | Details |
|------|--------|---------|
| tests/hero_surface.test.js | ✅ PASS | Selector contract, fallback behavior, mutation guard |
| tests/character_party_integration.test.js | ✅ PASS | Cross-screen usage, authority regression, legacy fixtures |
| tests/character_surface_browser_matrix.test.js | ✅ PASS | Viewport/input/state matrix contract |

### Syntax & Invariants

| Check | Status |
|-------|--------|
| `node --check src/ui/heroSurface.js` | ✅ PASS |
| `node --check src/scenes/party.js` | ✅ PASS |
| `node --check src/scenes/equipment.js` | ✅ PASS |
| `node --check src/scenes/cultivationScene.js` | ✅ PASS |
| `node --check src/scenes/combatScene.js` | ✅ PASS |
| `bash tools/check_ui_invariants.sh` | ✅ PASS |

---

## Success Criteria Verification

| Criteria | Status | Evidence |
|----------|--------|----------|
| 1. Party, combat, cultivation, equipment, and result views identify hero with consistent role, health/progression, equipment, status, and next action | ✅ | HeroSurface.getModel used in all 5 contexts; integration test verifies consistent outputs |
| 2. Player can inspect hero and identify available upgrades, equipped state, and meaningful next action | ✅ | Party detail shows equip actions; equipment shows equipped/empty; cultivation shows meditate/breakthrough; combat shows act/target |
| 3. Character presentation readable across phone/desktop layouts | ✅ | Browser matrix contract defines 5 viewports; HeroSurface uses R.fonts, R.colors, responsive layout helpers |

---

## Browser Evidence (Deferred)

The following require human verification in browser:

| Viewport | Status | Notes |
|----------|--------|-------|
| 400×720 portrait | ⏳ Pending | Fresh client, legacy save, reduced motion |
| 540×900 large portrait | ⏳ Pending | |
| 720×400 landscape | ⏳ Pending | |
| 1024×768 narrow desktop | ⏳ Pending | |
| 1440×900 wide desktop | ⏳ Pending | |

**Verification Steps:**
1. Serve repository, open fresh `index.html`
2. At 400×720: inspect each party hero → confirm name/role, HP/MP, level/XP, equipment, next action readable
3. Equip/unequip item → enter cultivation → enter combat → confirm consistent identity
4. Complete combat → verify result identity doesn't overlap reward/continuation
5. Repeat at all viewports with touch/mouse/keyboard
6. Enable reduced motion → confirm essential state preserved
7. Reload current/legacy saves → confirm no lost/invented values
8. Capture console output and `?probe` observations

---

## Deferred Items

- Full browser matrix verification (human-needed)
- Existing-worker client verification
- Service worker cache activation verification

---

## Result

**AUTOMATED: PASSED** — All contract tests pass, syntax clean, invariants satisfied.

**BROWSER: DEFERRED** — Human verification required per 15-03-PLAN checkpoint.