# Requirements — Mythika v13.0

## Version
Milestone: v13.0 — Screen-by-Scene Audit & Firebase Removal

## Scope Summary
- Selected: SCR — Screen audit (each Scene one-by-one), FBX — Firebase removal, VFY — Verification
- Deferred: none
- Out of Scope: new zones/element types, WebGL, framework/bundler/ES-module migration, backend/sync/multiplayer, unrelated content expansion

## Validated Requirements (carried forward, unchanged)
- All REQ / AFF / BST / ZON / GFT / SAV / LAY / SHP / ONB / ART / AUD / DMG requirements from v1–v12 remain validated and unchanged.

## Active Requirements

### SCR — Screen audit (one requirement per Scene, verified one-by-one)
- [ ] **SCR-01**: Audit title scene version number and details; update any stale detail
- [ ] **SCR-02**: Audit ashram scene version number and details; update any stale detail
- [ ] **SCR-03**: Audit authScene version number and details; update any stale detail
- [ ] **SCR-04**: Audit bazaar scene version number and details; update any stale detail
- [ ] **SCR-05**: Audit characterCreate scene version number and details; update any stale detail
- [ ] **SCR-06**: Audit combatScene version number and details; update any stale detail
- [ ] **SCR-07**: Audit cultivationScene version number and details; update any stale detail
- [ ] **SCR-08**: Audit debug scene version number and details; update any stale detail
- [ ] **SCR-09**: Audit encounterScene version number and details; update any stale detail
- [ ] **SCR-10**: Audit equipment scene version number and details; update any stale detail
- [ ] **SCR-11**: Audit farm scene version number and details; update any stale detail
- [ ] **SCR-12**: Audit fishing scene version number and details; update any stale detail
- [ ] **SCR-13**: Audit forge scene version number and details; update any stale detail
- [ ] **SCR-14**: Audit journeyScene version number and details; update any stale detail
- [ ] **SCR-15**: Audit party scene version number and details; update any stale detail
- [ ] **SCR-16**: Audit punarjanma scene version number and details; update any stale detail
- [ ] **SCR-17**: Audit questLog scene version number and details; update any stale detail
- [ ] **SCR-18**: Audit settings scene version number and details; update any stale detail
- [ ] **SCR-19**: Audit spiritBeast scene version number and details; update any stale detail
- [ ] **SCR-20**: Audit tournament scene version number and details; update any stale detail
- [ ] **SCR-21**: Audit travelMap scene version number and details; update any stale detail
- [ ] **SCR-22**: Audit trials scene version number and details; update any stale detail
- [ ] **SCR-23**: Audit welcome scene version number and details; update any stale detail
- [ ] **SCR-24**: Audit zoneExploration scene version number and details; update any stale detail

### FBX — Firebase removal
- [ ] **FBX-01**: Remove Firebase SDK CDN imports (`firebase-app`, `firebase-auth`, `firebase-firestore`) and init module from index.html
- [ ] **FBX-02**: Remove Firebase auth integration (app/auth/db globals) from src/engine/auth.js
- [ ] **FBX-03**: Remove authScene sign-in UI and its navigation route
- [ ] **FBX-04**: Remove src/engine/firebase-config.js and src/engine/firebase-config.template.js
- [ ] **FBX-05**: Remove `src/engine/firebase-config.js` from sw.js precache list
- [ ] **FBX-06**: Remove Firebase config generation steps and `FIREBASE_*` secrets from .github workflows
- [ ] **FBX-07**: Remove Firebase setup instructions from docs/*.md and INSTALL.md
- [ ] **FBX-08**: Confirm no Firebase references remain in codebase (grep clean)

### VFY — Verification (after audit + removal)
- [ ] **VFY-01**: Verify game boots and loads saves via localStorage without Firebase
- [ ] **VFY-02**: Confirm no scene retains an outdated version number
- [ ] **VFY-03**: Run full Node test suite; all green + UI invariants clean
- [ ] **VFY-04**: Run browser boot matrix at 5 viewport sizes clean
- [ ] **VFY-05**: Confirm `R.reducedMotion()` and shake-scoping contracts still hold

## Future Requirements (deferred)
- None

## Out of Scope (explicit exclusions)
- New zones, realms, element types, or broad progression content
- WebGL, frontend framework, bundler, ES-module migration
- Backend synchronization, multiplayer, cloud sync, server authority
- Firebase Authentication / Firestore cloud saves (removed entirely)

## Traceability
- (filled by roadmap — each REQ-ID mapped to exactly one phase)
