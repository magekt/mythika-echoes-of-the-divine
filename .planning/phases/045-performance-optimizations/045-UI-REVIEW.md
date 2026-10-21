# Phase 045 — UI Review

**Audited:** Wed Oct 21 2026
**Baseline:** abstract 6-pillar standards (no UI-SPEC.md present)
**Screenshots:** not captured — dev server runs on localhost:3000 (HTTP 200) but the Playwright CLI is not installed (`npx playwright screenshot` prompted to install browsers); code-only audit performed on `index.html` and `styles/game.css`

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Specific, thematic copy; no generic labels; error copy lacks remediation guidance |
| 2. Visuals | 3/4 | Clear centered focal point and hierarchy; three loading states; mobile fill mode shifts identity |
| 3. Color | 3/4 | Accent #e8a030 used ~9× (under overuse threshold), semantic error red; accent hardcoded instead of token |
| 4. Typography | 3/4 | 4 sizes / 1 weight; two font families; no utility classes |
| 5. Spacing | 2/4 | No spacing scale or tokens; arbitrary pixel values (17/14/4/116/120/18px) inconsistent |
| 6. Experience Design | 3/4 | Strong loading + error + disabled states; no error-retry/reload affordance on load failure |

**Overall: 17/24**

---

## Top 3 Priority Fixes

1. **No error-retry path on script load failure** — When any `<script src>` fails, the user is stuck on "A required file failed to load" (game.css:132-147) with no way to recover except a manual refresh, breaking error-recovery task completion. — Experience Design (3/4) — **Fix:** add a "Reload" button/action inside the `.loading.error` state that calls `location.reload()` or re-dispatches boot.

2. **No spacing scale; arbitrary pixel values** — Spacing values (17px/14px/4px padding on the auth input at game.css:50; 120px×4px progress bar at 99-100; label offset `calc(50% + 14px)` at 117; splash cross at `calc(50% - 116px)` at 152-153 and 18px×18px at 153-154) are scattered and inconsistent with no token or scale, making the shell hard to adjust consistently. — Spacing (2/4) — **Fix:** define spacing CSS custom properties (`--space-1`…`--space-6`) in `styles/game.css` and replace literal padding/margin/offset values with them.

3. **Accent color #e8a030 hardcoded ~9 times** — The brand accent is repeated literally (theme-color meta line 10, container border line 23, box-shadow line 25, progress bar line 111, splash text line 87, splash cross lines 157-158, label line 121, auth caret/focus lines 55 and 64) instead of a single token, inconsistent with the `--auth-input-focus`/`--auth-input-text` variable pattern already used for inputs (lines 54-55, 64-65). — Color (3/4) — **Fix:** define `--accent: #e8a030` at `:root` and substitute it for every literal `#e8a030` occurrence.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Evidence:** `index.html`, `styles/game.css`

- **No generic labels.** Grep for `Submit|Click Here|OK|Cancel|Save` returns nothing in the DOM shell; all copy is domain-specific ("Mythika: Echoes of the Divine" title at index.html:7; stage labels "Loading engine/data/systems/ui/scenes/boot" at index.html:52).
- **Specific, thematic copy.** Boot splash reads "⚔  Summoning the realms…" (game.css:79 via `content`), not a generic "Loading…".
- **Error copy present but not actionable.** "A required file failed to load" (game.css:133) is specific rather than "something went wrong," but offers no remediation (no "refresh/retry" cue) — the user must manually reload.
- **Empty states:** N/A — this is a boot/loader shell with no data views, so no empty-state copy applies.
- **Hardcoded initial label.** "Loading engine 0%" is hardcoded in HTML (index.html:112) before JS takes over; acceptable as a first paint but should ideally match the JS-driven label format.

**Verdict:** Good, contract substantially met; minor copy refinement needed on error remediation. Score 3/4.

### Pillar 2: Visuals (3/4)

**Evidence:** `styles/game.css`, `index.html`

- **Clear focal point.** The loading overlay centers the progress bar and label within `#game-container` (game.css:94-126); the boot splash "Summoning the realms…" is centered (game.css:78-93).
- **Visual hierarchy.** Accent progress bar (#e8a030, line 111) vs muted smaller label (rgba 0.7, 10px, lines 120-122) vs splash (12px, line 88) creates differentiation through size, weight, and color.
- **Icon-only buttons:** none exist in the DOM shell, so no aria-label/tooltip requirement is triggered.
- **Three visual states.** `.loading` (game.css:78), `.loading.error` (red variant, game.css:132-147), `.loading.out` (fade-out, game.css:165-166) — all present.
- **Mobile fill mode shifts identity.** At ≤420px the card border/shadow/border-radius are removed and it goes borderless/full (game.css:178-180) — adaptive, but changes the visual brand on small screens.

**Verdict:** Coherent visual hierarchy and clear focal point; all loading states present. Score 3/4.

### Pillar 3: Color (3/4)

**Evidence:** `styles/game.css`, `index.html`

- **Accent #e8a030 usage count: ~9 elements** — theme-color meta (index.html:10), container border (game.css:23), box-shadow (25), progress bar background (111), splash text (87), splash cross gradients (157-158), label color (121), auth caret-color fallback (55), auth focus outline fallback (64). Under the >10-element overuse threshold, and all are functional brand uses (border, progress indicator, splash branding, focus indicator) rather than decorative overuse.
- **Semantic error color.** `#c83030` red used for `.loading.error` text/background/bar (game.css:134, 140, 143, 146) — good error/success separation.
- **60/30/10 roughly observed.** ~60% dark background (#0a0a1a body line 3, #15152a container line 22), ~30% secondary dark, ~10% accent #e8a030.
- **Accent hardcoded, not tokenized.** #e8a030 is repeated literally ~9 times instead of a single CSS token, inconsistent with the `--auth-input-focus`/`--auth-input-text` variable pattern already in use (game.css:54-55, 64-65).

**Verdict:** Good accent discipline and semantic error color; main gap is lack of an accent token. Score 3/4.

### Pillar 4: Typography (3/4)

**Evidence:** `styles/game.css`

- **Distinct font sizes: 4** — 10px label (120), 12px splash (88), 14px error (135), 16px auth input (56). At the abstract-standard limit (not >4), acceptable for a fixed-canvas shell.
- **Distinct font weights: 1** — no `font-weight` declarations anywhere; effectively weight 400 throughout. Under the >2-weights threshold.
- **Two font families.** Body uses `'Courier New', monospace` (10); auth input uses `'Geist', -apple-system, BlinkMacSystemFont, sans-serif` (56) — intentional for inputs but a second family.
- **No utility classes.** No `text-xs`…`text-5xl` classes (no Tailwind in this project).

**Verdict:** Limited but consistent scale; exactly 4 sizes and 1 weight. Score 3/4.

### Pillar 5: Spacing (2/4)

**Evidence:** `styles/game.css`

- **No spacing scale or tokens.** No `p-`/`m-`/`gap-`/`space-` utility classes (no Tailwind), and no CSS custom properties for spacing.
- **Arbitrary pixel values throughout:** `padding: 17px 14px 4px` (auth input, line 50), progress bar `120px × 4px` (lines 99-100), label `top: calc(50% + 14px)` (line 117), splash cross `left: calc(50% - 116px)` (lines 152-153) and `18px × 18px` (lines 153-154), `border-radius: 8px` (line 24).
- **Inconsistent values.** 17/14/4/116/120/18px share no rhythm; changing one requires hunting literals.
- **Fixed-canvas context.** Because `#game-container` is fixed 400×720 (lines 20-21), fixed pixels are defensible, but the absence of any scale still makes maintenance fragile.

**Verdict:** Notable gaps — no scale, arbitrary/inconsistent values. Score 2/4.

### Pillar 6: Experience Design (3/4)

**Evidence:** `index.html`, `styles/game.css`, PLAN.md threat model

- **Loading states present.** Progress bar driven by `__mythikaLoadTracker` (index.html:43-55), updated per group via `step()` (lines 132, 153, 181, 193, 221, 223). The WR-01 off-by-one is fixed: `updateOverlay()` now uses the *previous* group's `cumDone` (index.html:48-49) so the percentage reflects actual completion rather than being one group ahead.
- **Error states present.** Window `error` listener for failed `<script src>` (index.html:74-76), `markError()` (57-61), `.loading.error` red variant (game.css:132-147).
- **Disabled states present.** Auth-input `:disabled` and `.is-hidden` handled (`visibility: hidden; pointer-events: none`, game.css:67-71).
- **Empty states / destructive confirmations:** N/A — no data views or destructive actions in this boot shell.
- **?probe opt-in with privacy.** Probe timing is console-only, not transmitted; `?probe=1` is a no-op (must be bare/trailing) per PLAN.md threat model T-045-03 — well considered.
- **Gap: no error recovery.** On load failure there is no retry/reload affordance — the user is stuck and must manually refresh, which degrades error-recovery task completion.

**Verdict:** All applicable checklist items pass; the missing reload-on-error is the one real experience gap. Score 3/4.

---

## Registry Safety Audit

`components.json` not present → shadcn not initialized; `UI-SPEC.md` not present → no third-party registries listed. Registry Safety audit skipped; no Registry Safety section added. (0 third-party blocks checked, no flags.)

---

## Files Audited

- `index.html` — host page, loading overlay (`__mythikaLoadTracker`), `__mythikaProbeGroup` timing, Firebase module placement, script-load error listener
- `styles/game.css` — all UI styling (container, loader, progress bar, splash, error state, auth input, media queries)
- `tests/performance_probe.test.js` — probe timing unit tests (not UI, but part of the phase)
- `.planning/phases/045-performance-optimizations/045-PLAN.md` and `045-SUMMARY.md` — phase context and intent
