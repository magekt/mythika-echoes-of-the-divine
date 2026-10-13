# Phase 29 — UI Review (Hero Gifts)

**Audited:** 2026-10-09
**Baseline:** Abstract 6-pillar standards (no UI-SPEC exists; vanilla-JS immediate-mode Canvas 2D game, logical 400x720, DPR scaling, semantic `R.colors`/`R.fonts`/`R.radius` tokens, `R.reducedMotion`, 44px+ touch targets)
**Screenshots:** Not captured (no dev server on :3000 — code-only audit of `src/scenes/party.js` gift flow + `src/data/items.js` presentation data)
**Registry audit:** N/A — no `components.json`, no shadcn, no third-party registries in this repo

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Blocker copy names tier/cap; fallback + empty state are generic/unguided |
| 2. Visuals | 2/4 | Locked/liked rows visually identical; suffix-only differentiation, no desc line |
| 3. Color | 3/4 | All-semantic tokens, zero raw hex in new code; locked rows share active gold affordance |
| 4. Typography | 4/4 | 4 semantic sizes (xs/sm/md/lg), consistent with file conventions |
| 5. Spacing | 3/4 | Detail 8px rhythm + correct 7-action contentHeight; picker rows dense but consistent |
| 6. Experience Design | 2/4 | Full denial coverage + degraded path, but 28px picker rows miss 44px target; no disabled pre-state |

**Overall: 17/24**

---

## Top 3 Priority Fixes

1. **Gift picker rows are 28px tall (Back is 30px) — below the 44px touch target floor** (`src/scenes/party.js:701`, `:796`) — mis-taps on small portrait screens; thumb users re-tap and hit the wrong gift — raise gift rows to ≥44px (row step 34→50+) and Back to 44px, matching the 48px detail actions (`:404`) and bazaar footer 44px precedent.
2. **Tier-locked gifts look identical to giveable gifts (same `btnGold` row, white text)** (`src/scenes/party.js:701-728`) — players tap a locked gift expecting success and eat a denial Toast + error buzz for a predictable outcome — render locked rows with a dimmed/disabled treatment (`R.colors.btn` or panel bg + `R.colors.textDim` label, keep `🔒Sworn` suffix) so affordance matches outcome.
3. **Picker shows name + `♥`/`🔒` suffix only — no gift `desc`, no diminishing preview, no weekly-cap signal** (`src/scenes/party.js:706-710`; descs exist in `src/data/items.js:117-135`) — players cannot tell what a gift is or what it will grant (+13/+8/+5/+3, cap 26/wk) before spending it — add a second `R.fonts.xs` desc line (bazaar `:88` precedent) and a diminishing/cap hint (e.g. suffix `+13` first-gift preview or a header cap counter).

---

## Detailed Findings

### Pillar 1: Copywriting (3/4) — WARNING

**What passes:** the seven denial reasons all name the requirement, never a bare refusal — `giftDenialCopy()` (`src/scenes/party.js:102-112`):
- `not_liked`: `"X has no fondness for Y."` (`:105`) — specific, personality-consistent.
- `tier_locked`: `"Y stirs only a Sworn+ bond."` (`:106`) — names the tier via `res.need`.
- `capped`: `"X needs time — gifts rest for now."` (`:107`) — explains the rest mechanic.
- `maxed`: `"Your bond with X cannot deepen further."` (`:110`) — clear terminal state.
- Success `"+<applied> bond with X!"` (`:769`, 🎁) and tier-up `"X reaches <tier>!"` (`:777`, ★ gold, 3s) follow existing Toast conventions.

**Findings:**
- (WARNING) Fallback copy `"The gift finds no purchase."` (`:111`) is archaic/generic — the one denial a player cannot act on. Replace with `"The gift has no effect right now."` or route the actual reason through.
- (WARNING) `capped` copy never states the reset horizon (weekly-equivalent). Player does not learn *when* to return. Append `" — try again in time."` is already implied; better: `"…gifts rest for now (restores with time)."`.
- (WARNING) Empty state `"No gifts available."` (`:678`, via generic `'No ' + filterType + 's'` → `"No gifts available."`) gives no sourcing hint. Gifts come only from ~12% loot drops (no shop). Add: `"No gifts yet — gifts drop from victories."`.
- (Minor) Picker header `"Select gift for X"` (`:674`) lowercases the category while the action button reads `"Give Gift 🎁"` (`:555`); harmless inconsistency, consider `"Select a gift for X"`.
- (Minor) Lock suffix concatenates without space: `' 🔒' + def.minTier` → `"🔒Sworn"` (`:92`). Add a space or `+` (`🔒 Sworn+`) to match denial copy's `"Sworn+ bond"`.

### Pillar 2: Visuals (2/4) — WARNING

- (WARNING) No visual hierarchy between states: liked (`♥`), locked (`🔒Sworn`), and neutral gifts all render the same gold row + white label (`:701-728`). The `♥`/`🔒` suffix is the *sole* differentiator — suffix-only encoding with no color/shape/position change. On a 400-wide logical canvas, `"Crossroads Scale of Dharma 🔒Sworn"`-length labels risk clipping against the row edge (no truncation/measure guard in the gift render path, `:726`).
- (WARNING) Gift `desc` strings (well-written, zone/story-flavored, `src/data/items.js:117-135`) are never rendered in the picker — rows show name×qty+suffix only (`:709`). Bazaar precedent renders a second desc line (`src/scenes/bazaar.js:88`); the gift picker drops it, so 19 flavored gifts read as bare names.
- (OK) Detail placement is sound: `Give Gift 🎁` sits directly after `Use Item` (`:551-565`), styled secondary (`surfaceElevated`, not gold), so the primary CTA keeps primacy — matches plan intent.
- (OK) Tier-up celebration is Toast-only (gold ★, 3s duration, `:777`) plus rebuild; no new animation introduced — appropriate for the reduced-motion contract (see Pillar 6).
- (Minor) Emoji icon set (🎁/♥/🔒/★/🔒-on-denial) is canvas-consistent with the rest of party.js; no DOM/aria layer exists in this engine, so no aria finding applies — but note 🔒 is reused for both equip-incompatibility (`:745`) and gift denials (`:784`), slightly blurring meaning.

### Pillar 3: Color (3/4) — WARNING

- (OK) Zero raw hex / `rgb()` in `src/scenes/party.js` (verified by grep — none). All gift-path color references are semantic: `surfaceElevated/btnHover/textPrimary` (gift button, `:554-559`), `btnGold` (rows), `success` (grants), `danger` + 🔒 (denials, `:784`), `gold` + ★ (tier-up, `:777`). Matches file and system conventions.
- (WARNING) Locked rows use the identical `btnGold` + white-text + blue side-strip treatment as giveable rows (`:701-728`; strip is `green` only for consumables, `:714`). A locked gift therefore *advertises* the active affordance and then denies — the semantic-token usage is correct but the *distribution* is wrong. Fix per Top Fix #2 (dimmed bg + `textDim` label for locked rows).
- (OK) Toast color semantics are consistent: success=grants, danger=all denials including `not_liked`/`capped` (correct — these are errors, not neutral info), gold=tier-up/recruit-class celebrations.
- (OK) Hairline-border secondary-action treatment (`:532-535`, `borderHairline`, `accent` when pressed) keeps the 7-action stack from becoming a wall of gold — 60/30/10 analogue holds (panel surfaces dominate, gold reserved for primary/celebration).

### Pillar 4: Typography (4/4)

- Distinct `R.fonts.*` tokens in `party.js`: exactly **xs / sm / md / lg** (grep-verified) — at the ≤4-size boundary, all semantic, no ad-hoc canvas font strings in the gift path.
- Gift-path usage: header + rows + empty state all `R.fonts.sm` (`:674, :678, :719-726`); hero name `lg`, meta `sm/xs` — unchanged hierarchy, gift rows inherit the file's list-row voice. No new weights introduced.
- (Minor, non-deducting) The picker never uses `xs` for a desc line because it renders no desc line — fixing Top Fix #3 with an `xs textDim` desc would stay inside the existing 4-size scale.

### Pillar 5: Spacing (3/4)

- (OK) Detail 7-action layout is correctly recomputed: `actionCount 6→7`, `buttonH 48`, `gap 8`, `topPad 16`, `contentHeight` grows (`:400-418`), and `getContentHeight` reclaims the nav band in detail view (`:150-155`) so the 7th action stays reachable — scroll math (`clampScroll`, `Scene.scrollInput`) unchanged and compatible.
- (OK) Gift button inserted between Use Item and Equip Weapon with zero drift to sibling actions; Use/Equip branches byte-identical per plan.
- (WARNING) Picker density: 28px rows on a 34px step (6px gap, `:701, :791`) and a 30px Back button (`:796`) — internally consistent rhythm, but every picker row is a touch target, not a label, so the rhythm is *consistently below* the 44px contract (see Pillar 6). Spacing system itself is coherent; the row-height constant is the defect.
- (OK) No arbitrary-value sprawl in the gift diff: `20/14/G.W-40/G.W-28` match surrounding conventions; no `[..px]`-style escapes (N/A in canvas code).

### Pillar 6: Experience Design (2/4) — BLOCKER + WARNINGs

- **(BLOCKER) Touch targets:** gift rows 28px (`:701`) and Back 30px (`:796`) vs the 44px+ contract. Detail actions are 48px (`:404`) and even the file's own card comment cites the 44×44 minimum (`:185`) — the new picker undercuts the file's own standard. On 400×720 portrait this is the primary gift-giving surface; mis-taps spend real (loot-only, unsellable, ~12% drop) inventory on the *wrong hero-item pair* and burn the first-gift +13 diminishing step. Fix per Top Fix #1.
- (WARNING) No disabled pre-state: tier-locked and capped gifts are fully tappable and resolve into denial Toasts + `Audio.error()` (`:784-785`). The scene *already computes* lock state for the suffix (`giftSuffixFor`, `:89-94`) — use it to dim/disable the row instead of inviting a doomed tap.
- (WARNING) No outcome preview: diminishing position (+13/+8/+5/+3), pair count, and weekly total (cap 26) are invisible until after the tap; partial grants (`applied < gain`) toast only `"+<applied> bond"` with no cap note — a +1 grant reads as a bug. Surface at minimum a first-gift `+N` hint or a `"resting"` marker when capped.
- (WARNING) Denial leaves the picker open with no guidance (correct — no destructive loss) but `capped`/`tier_locked` offer no redirect (e.g. which bond scenes raise tier). Acceptable for now; consider appending tier-raise hint to `tier_locked` copy.
- (OK) State coverage: success → Toast + tier-up Toast + `buildDetail()` rebuild (affinity meter refresh, `:780-782`); all 8 `giveGift` reasons mapped to copy (`:102-112`); `BondSystem` absent/skew → `"Gifting unavailable right now."` danger Toast, never throws (`:763-767`); `try/catch` around `giveGift` (`:756-762`). Scene never writes affinity/flags/inventory directly — canonical-authority pattern holds.
- (OK) Reduced motion: no new animation added (Toasts + rebuild only, per plan) — nothing to gate behind `R.reducedMotion()`; note `party.js` contains no `reducedMotion` reference at all, so this holds only because the phase adds zero motion. The tier-up moment uses `Audio.heal()` (`:779`) rather than `Audio.levelUp()` (used for recruit bonds, `:358`) — under-celebrated; switch tier-up audio to `levelUp()` (audio, not motion, so no reduced-motion conflict).
- (OK) Destructive-action posture is correct: gifts are consumable but each grant is small and denials consume nothing — no confirmation dialog warranted.

---

## Portrait / Desktop Readability (400×720 · 1440×900 logic)

- 400×720 portrait: 7×48px actions + gaps ≈ 384px panel — fits the scrollable detail column with the reclaimed nav band; picker rows full-width (`G.W-28`) with 12px text inset — readable, but 28px rows + longest locked labels (`… 🔒Sworn`) are the overflow + mis-tap risk noted above. No browser to confirm clipping — flagged statically.
- Wide logic (1440×900): rows stretch full-width (`G.W-28`) per file-wide convention — same as all other party lists, no gift-specific breakage; no max-width/gutter regression introduced.
- DPR scaling: gift code draws only through `R.*`/`UI.Button` primitives — no raw canvas sizing — so DPR behavior inherits the engine path unchanged.

---

## Files Audited

- `src/scenes/party.js` — `giftSuffixFor()` (`:81-99`), `giftDenialCopy()` (`:102-112`), `getDetailActionLayout` 7-action (`:400-418`), `Give Gift 🎁` button (`:551-565`), `buildItemList('gift')` rows + `giveGift` wiring + Toasts (`:657-806`)
- `src/data/items.js` — `ITEMS.gifts` 19-item catalog + descs (`:116-136`), `HERO_GIFTS` 5×10 rosters (`:142-148`)
- `src/systems/bond.js` — `giveGift` reason set consumed by the UI (reference only; logic audited by unit tests, 20/20)
- `.planning/milestones/v4.0-phases/29-hero-gifts/` — `29-CONTEXT.md`, `29-01/02/03-PLAN.md`, `29-01/02/03-SUMMARY.md` (intent baseline)
