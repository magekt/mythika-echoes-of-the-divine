# Phase 51: Spring Config Registry — Context

## Grey Area Decisions (auto-accepted, yolo mode)

### A. Registry Structure
- **Decision:** `R.springConfigs` is a plain object with named config objects. `R.springConfig(name)` returns the config by name (throws if not found).
- **Rationale:** Simple, explicit, no magic. Matches the pattern of `R.colors` — a plain object with semantic keys.
- **Source:** REQUIREMENTS.md SPR-01, SPR-02

### B. Config Naming Convention
- **Decision:** Use camelCase keys matching the use case: `buttonPress`, `iconPress`, `panelEnter`, `modalOverlay`, `modalButton`, `revealStagger`, `sceneEnter`. Duplicate `iconPress`/`panelEnter`/`modalOverlay` entries in REQUIREMENTS.md are duplicates — use unique keys.
- **Rationale:** Clear, self-documenting names. Call sites read `R.spring(R.springConfigs.buttonPress)` — self-documenting.
- **Source:** REQUIREMENTS.md SPR-01 (deduplicated)

### C. Config Structure
- **Decision:** Each config is `{ stiffness, damping, target, delay?, duration? }`. `delay` in ms for staggered animations; `duration` in ms for total animation time (used by `R.easePremium` timing).
- **Rationale:** Covers all current use cases. `delay` for staggered cascades; `duration` for entrance timing.
- **Source:** REQUIREMENTS.md SPR-01

### D. Registry Access
- **Decision:** `R.springConfig(name)` returns the config object (or throws if not found). `R.spring(R.springConfigs.buttonPress)` pattern for callers.
- **Rationale:** Explicit, discoverable, testable. No magic strings in hot paths — config resolved once at construction.
- **Source:** REQUIREMENTS.md SPR-02

### D. Extensibility
- **Decision:** Registry is a plain object — new configs added by assigning `R.springConfigs.newName = { ... }`. No modification to `R.spring` needed.
- **Rationale:** Open for extension, closed for modification. Matches `R.colors` pattern.
- **Source:** REQUIREMENTS.md SPR-04

### E. Config Values (from audit of existing inline springs)
| Name | Stiffness | Damping | Target | Delay | Duration | Source |
|------|-----------|---------|--------|-------|----------|--------|
| `buttonPress` | 300 | 24 | 0.97 | — | — | `button.js:98` |
| `iconPress` | 300 | 24 | 1.05 | — | — | `button.js:421` (pressStiffness/pressDamping) |
| `panelEnter` | 300 | 24 | 1 | — | — | `panel.js` (via `R.easePremium` implicit) |
| `modalOverlay` | 300 | 24 | 1 | — | — | `modal.js` (via `R.easePremium` implicit) |
| `modalButton` | 300 | 24 | 1 | 40ms | — | `modal.js` (40ms stagger) |
| `revealStagger` | 300 | 24 | 1 | 40ms | — | `scene-helpers.js` (stagger delay) |
| `sceneEnter` | 300 | 24 | 1 | — | 400ms | `scene-helpers.js` (entranceReveal DURATION=400) |

---

## Files to Modify
- `src/engine/renderer.js` — add `R.springConfigs` object + `R.springConfig(name)` accessor
- `src/ui/button.js` — replace inline spring configs with `R.springConfigs.buttonPress`, `iconPress`
- `src/ui/panel.js` — use `R.springConfigs.panelEnter`
- `src/ui/modal.js` — use `R.springConfigs.modalOverlay`, `modalButton`
- `src/engine/scene-helpers.js` — use `R.springConfigs.revealStagger`, `sceneEnter`
- `src/scenes/travelMap.js` (3×), `cultivationScene.js`, `combatScene.js`, `fishing.js` — replace inline configs

### New Test File
- `tests/spring_registry.test.js` — verifies registry resolution, spring behavior

---

## Success Criteria (from REQUIREMENTS.md SPR-01..04)

1. `R.springConfigs` object exists with 12 named configs (deduplicated from 12→12 unique)
2. `R.springConfig(name)` returns config by name (throws if not found)
3. All 8+ inline spring configs replaced with `R.spring(R.springConfigs.<name>)` references
3. New spring configs can be added without modifying `R.spring` (open for extension)
4. `node --test tests/spring_registry.test.js` passes

---

## Verification Commands
- `node --check src/engine/renderer.js`
- `node --check tests/spring_registry.test.js`
- `node --test tests/spring_registry.test.js` — pass
- `node --test tests/*.test.js` — full suite green
- `tools/check_ui_invariants.sh` — all pass

## Source Attribution
- Decisions from: REQUIREMENTS.md (SPR-01..04), ROADMAP-v10.md Phase 51
- Phase goal: "Centralize all spring configurations in R.springConfigs registry; replace 8+ inline spring configs with R.springConfigs.* references"
- Dependencies: Phase 50 (needs R.spring from Phase 46)
- UI hint: no

---

## Output
Write CONTEXT.md to `.planning/phases/051-spring-config-registry/51-CONTEXT.md`