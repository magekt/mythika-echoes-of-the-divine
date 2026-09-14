# Phase 02: Access-Gate Enforcement — Research

**Researched:** 2026-09-14
**Domain:** Game authority gate enforcement — adding system-level entry validation to 6 gated features
**Confidence:** HIGH

## Summary

Phase 02 adds system-level authority gates to six game features that currently lack entry-point validation. Phase 01 established the canonical authority pattern via `ZoneAccess` in `src/data/zones.js` — a two-method object (`status()` returning `{allowed, reason}`, `enter()` gating mutations). Every Phase 02 gate follows this same pattern: a system-level `Access` object with `status()` and `enter()` (or feature-specific name), which scenes call before performing mutations. UI mirrors the authority but never replaces it.

**Primary recommendation:** Implement each gate as a standalone `const XxxAccess = { status(), enter() }` object in the appropriate system/data file. Scenes call `.status()` to disable buttons and show reason text, and call `.enter()` at the top of any mutation path. `enter()` returns `{allowed:false, reason:...}` on failure with no side effects.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Journey eligibility | Systems (`journey.js`) | Scene (`journeyScene.js`) | Authority lives in JourneySystem; scene mirrors it |
| Rebirth validation | Scene (`punarjanma.js`) | Data (`perks.js`) | Rebirth is scene-scoped; authority validates before mutation |
| Forge escalation | Scene (`forge.js`) | Systems (Economy) | Forge upgrade is scene-initiated; validates gold + level |
| Recruit capacity | Scene (`party.js`) | Systems (Economy, Progression) | Party composition is scene-managed |
| Tournament fee | Scene (`tournament.js`) | Systems (`duel.js`) | Tournament is scene-scoped |
| Trials entry | Scene (`trials.js`) | Flags (`G.state.flags`) | Trials gated behind flag + hero existence |

---

## Standard Stack

No new libraries. All gates use:
- `G.state` — canonical game state (direct read)
- `Economy.spendGoldOrNotify(cost)` — authoritative gold transaction (Phase 01)
- `Notify.show(message, priority, color)` — user-facing feedback
- `R.colors.*` / `R.fonts.*` — design tokens

**Phase 01 Analog Pattern (ZoneAccess):**
```js
// src/data/zones.js — lines 94–128
const ZoneAccess = {
  status: function(zoneId) {
    const zone = ZONES[zoneId];
    if (!zone) return { allowed: false, reason: 'unknown-zone' };
    // ... check prerequisites, level, completion
    return { allowed, complete, percentage, prerequisiteMet, levelMet, reason };
  },
  enter: function(zoneId) {
    const status = this.status(zoneId);
    if (!status.allowed) return status;
    // ... gate state mutation
    return status;
  }
};
```

---

## Architecture Patterns

### Authority Gate Pattern (from Phase 01)
**What:** System-level object with `status()` and `enter()` methods. Scenes call `status()` for UI state (disabled buttons, reason text), and `enter()` before any mutation. `enter()` returns the status on failure with zero side effects.

**When to use:** Any feature entry point where a condition (gold, level, flag, capacity) must prevent state mutation.

**Expected structure for each gate:**
```js
const XxxAccess = {
  status: function(/* params */) {
    // Pure read — no mutations
    return { allowed: Boolean, reason: String, ...extra };
  },
  enter: function(/* params */) {
    const s = this.status(/* params */);
    if (!s.allowed) return s;
    // Perform the gated action (gold spend, state set, etc.)
    return { ...s, allowed: true };
  }
};
```

### Scene Integration Pattern
Scenes read `.status()` in `buildButtons()` or `buildMenu()` to:
1. Set `btn.enabled = status.allowed`
2. Show `status.reason` as subtitle text
3. On click, call `.enter()` and only proceed if `result.allowed === true`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gold transaction | Custom `G.state.gold -= cost` | `Economy.spendGoldOrNotify(cost)` | Centralized validation + notification |
| Hero state creation | Manual stat init | `createHeroState(hid)` | Ensures canonical hero shape |
| Duplicate detection | Manual array scan | `G.state.party.some(h => h.id === hid)` | Direct, no extra abstraction |

---

## Common Pitfalls

### Pitfall 1: Gate in UI Only
**What goes wrong:** Button is disabled in `buildButtons()` but the mutation path has no validation. A programmatic call bypasses the gate.
**How to avoid:** Always add authority in the system/scene mutation path (`enter()` method), not just in button rendering.
**Warning signs:** Gate logic only appears inside `buildButtons()` or `render()`.

### Pitfall 2: Silent Failure Without Notification
**What goes wrong:** `enter()` returns `{allowed:false}` but no user-facing message is shown.
**How to avoid:** Scenes should call `Notify.show(status.reason, 2, R.colors.red)` when `.enter()` returns `{allowed:false}`.
**Warning signs:** `enter()` returns without calling `Notify.show()`.

### Pitfall 3: Stale State in Recruit/Duplicate Check
**What goes wrong:** Recruit list is built once but party changes between build and click.
**How to avoid:** `recruitHero()` re-validates `G.state.party.length < 5` and `!G.state.party.some(h => h.id === hid)` at mutation time, not just at UI build time.

### Pitfall 4: Missing Gate in Programmatic Call Sites
**What goes wrong:** `JourneySystem.start()` is called from `Progression.addPartyXP()` (level 10 trigger) without eligibility check.
**How to avoid:** The authority gate lives inside `JourneySystem.start()` itself — any caller is automatically gated. The scene uses `JourneyAccess.status()` for UI only.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual browser testing (no unit test framework) |
| Config file | none — game runs via `index.html` |
| Quick run command | Open `index.html` in browser, navigate to gated feature |
| Full suite command | Per-gate browser test matrix (see below) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-006 (Journey) | Journey start blocked when ineligible | browser-test | console: `JourneyAccess.status('karmicCrossroads')` | ✅ |
| REQ-006 (Rebirth) | Rebirth blocked below level 30 or < 10 karma | browser-test | console: navigate to punarjanma scene | ✅ |
| REQ-006 (Forge) | Upgrade blocked when gold insufficient | browser-test | console: navigate to forge, attempt upgrade | ✅ |
| REQ-006 (Recruit) | Recruit blocked when party full or duplicate | browser-test | console: `partyScene.recruitHero('hero1')` with full party | ✅ |
| REQ-006 (Tournament) | Tournament blocked when gold insufficient | browser-test | console: navigate to tournament, attempt start | ✅ |
| REQ-006 (Trials) | Trials blocked when boss not defeated | browser-test | console: navigate to trials without `boss_svarga` flag | ✅ |

### Sampling Rate
- **Per task commit:** Manual browser test of the specific gate
- **Per wave merge:** Full per-gate browser matrix
- **Phase gate:** All 6 gates pass; failed-attempt side-effect check (state unchanged)

### Wave 0 Gaps
- [ ] No Wave 0 needed — all verification is browser-based manual testing (matches Phase 01 pattern)

---

## Security Domain

> security_enforcement: enabled (absent = true), ASVS L1, block on high.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V4 Access Control | Yes | `XxxAccess.status()` / `.enter()` pattern |
| V5 Input Validation | Yes | Validate `journeyId` against `JOURNEYS` keys, `hid` against `HEROES` keys |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cheat engine: bypass gold check | Tampering | Authority gate validates at system level, not UI |
| Direct G.state mutation via console | Tampering | `enter()` re-validates before all mutations |
| Duplicate hero exploit | Tampering | `.some(h => h.id === hid)` check at mutation time |

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-006 | Authoritative Access Gates — Phase 02 scope | All 6 gates follow ZoneAccess pattern; authority at system/scene entry |
| REQ-010 | Cross-Screen Consistency | `JourneyAccess.status()` called from ashram.js buttons; `TrialsAccess.status()` mirrors badge state |

---

## Open Questions (RESOLVED)

1. **Journey capacity: how many simultaneous journeys?** — RESOLVED: `G.state.journeys.active` tracks single active journey. One at a time. Gate: `if (G.state.journeys.active && G.state.journeys.active !== journeyId) return { allowed: false, reason: 'journey-active' }`.
2. **Perk selection validation: which perks are valid?** — RESOLVED: `PERKS.tier1` contains unlocked perk IDs. Gate checks `PERKS.tier1[perkId]` exists and player has not already purchased it.
3. **Forge max level?** — RESOLVED: Upgrade levels are unbounded by design (game encourages progression). Gate only checks gold and hero existence.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `getAvailableJourneys` is undefined (falls back to `Object.values(JOURNEYS)`) | Journey system | Low — confirmed by grep of journey.js line 20 |
| A2 | `recruitCosts` array is `party.data.recruitCosts` (indexed by party length - 1) | Recruit | Low — confirmed by party.js line 113 |

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: `src/data/zones.js` (ZoneAccess pattern), `src/systems/journey.js`, `src/scenes/punarjanma.js`, `src/scenes/forge.js`, `src/scenes/party.js`, `src/scenes/tournament.js`, `src/scenes/trials.js`

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — no new libraries; all patterns established in Phase 01
- Architecture: HIGH — ZoneAccess pattern is proven and well-understood
- Pitfalls: MEDIUM — gate-in-UI-only and stale-state patterns require attention

**Research date:** 2026-09-14
**Valid until:** 2026-10-14 (stable — no external dependencies)
