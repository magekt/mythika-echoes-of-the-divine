# Phase 30 Discussion Log

**Date:** 2026-10-09
**Mode:** user-led analysis (eight decisions with evidence + one open question)

## Areas

### Hook point
- Presented: wrap `fillText` prototype (user proposal with modal/travelMap evidence).
- Selected: prototype wrap via `add_init_script`. Verified counts corrected (34 raw calls, travelMap-heavy).

### Frame sampling
- Presented: per-frame record, settled-frame assert.
- Selected: settled frame with Reduce Motion on (fade-toast false positives).

### Exclusion mechanism
- Presented: explicit wrapper vs z-flag.
- Selected: z-layer flag in Notify/Modal render (two engine lines).

### Containment scope (open question)
- Presented: accept canvas+scroll-clip containment vs require panel containment now.
- Selected: accept limited scope; panel containment deferred as follow-up. Rationale: wrapper blindness to panel bounds + enabler criticality + all-11-defects covered.

### Fail-first fixture
- Presented: frozen fixture with expected violating pairs.
- Selected: as proposed, plus harness-is-the-bug rule.

### Scene entry
- Presented: `gScene` + seeded save, real combat entry with fixed RNG.
- Selected: as proposed.

### Combat simulator
- Presented: Node vm concatenation in script order.
- Selected: vm route, three reported numbers.

### Output format
- Presented: JSON per run, nonzero exit, existing CI workflow.
- Selected: as proposed.

## Deferred ideas
- Panel-level containment follow-up; title wordmark split (already roadmap-noted).
