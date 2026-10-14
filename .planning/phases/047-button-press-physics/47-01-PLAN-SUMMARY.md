Phase 47 — Button Press Physics & CTA

Files changed:
- src/ui/button.js
- tests/button.test.js

Tests added/updated:
- tests/button.test.js (3 tests)

Verification (commands run):
- node --check src/ui/button.js
- node --check tests/button.test.js
- node --test tests/button.test.js
- node --test tests/*.test.js
- tools/check_ui_invariants.sh

Results:
- All checks passed.

Notes / caveats:
- Base UI.Button uses ctx.translate/scale around center with _visualScale driven by R.spring; reduced motion snaps scale instantly.
- MagneticBtn trailing arrow is now always rendered when trailingIcon is set, wrapped in a nested 24px circle; arrow translation remains magnetic on hover, while icon press scaling is tied to pressed/held state.
