# Phase 36 Context: Ship Readiness

## Domain Boundary
Ship Readiness: adding licensing (MIT), quieting the Firebase 404 in prod, gating the debug scene behind URL params, and ensuring a zero-warning console on clean boot.

## Implementation Decisions

### OpenCode's Discretion
All implementation choices are at OpenCode's discretion — pure infrastructure phase.

- **License Strategy**: Use MIT License per standard open-source conventions. Insert SPDX identifier `// SPDX-License-Identifier: MIT` in `index.html` and `src/main.js`.
- **Firebase Warning Control**: Modify `index.html` block around `fetch('src/engine/firebase-config.js')`. If response is not ok (e.g., 404), do not log a warning unless `window.location.search.includes('probe')` is true. Set `window.firebaseReady=false` silently in prod.
- **Debug Scene Gate**: In `src/main.js:60`, change the registration condition for `debugScene` from `typeof debugScene !== 'undefined'` to `(typeof debugScene !== 'undefined' && window.location.search.includes('debug'))`.

## Existing Code Insights
- `index.html:91-94` handles Firebase config fetch error currently.
- `src/main.js:60` registers `debugScene`.
- No existing `LICENSE` file in repo root.

## Specific Ideas
No specific UX requirements — infrastructure phase.

## Deferred Ideas
None.
