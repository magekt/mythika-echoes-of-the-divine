# Phase 43 Plan Summary: Loading Overlay and Progress Reporting

## Objective
Implement loading overlay with progress reporting that shows live script loading percentage, current stage, and properly handles success/failure cases while coordinating with input readiness state.

## Requirements Addressed
- LOAD-01: Users see a loading overlay displaying live progress percentage and current script group during boot
- LOAD-02: Overlay shows current stage (e.g., 'Loading engine', 'Loading data') as each dependency group finishes
- LOAD-03: Overlay dismisses automatically when first frame renders AND input is ready
- LOAD-04: Failed critical script shows visible error message instead of infinite spinner
- LOAD-05: After script failure, input is not permanently blocked (game can be refreshed)
- INPUT-03: Input processing guarded during loading (implemented via Input._ready check)
- INPUT-04: Input readiness properly coordinated with loading state

## Files Modified
- index.html: Progress tracking system with script group definitions and load/error handlers
- src/engine/input.js: Input._ready flag initialization and UI consumption guards
- src/engine/game.js: Enhanced overlay dismissal requiring both frame render and input readiness
- src/main.js: Enhanced failBoot with error messaging and input readiness coordination
- styles/game.css: Loading overlay styling including error states

## Key Coordination Points
1. Script loading progress tracked in index.html updates percentage and stage
2. On script load completion, index.html sets Input._ready = true
3. Input.js UI methods (consume/getPress) check Input._ready before processing input
4. game.js requires BOTH G.frameCount === 1 AND Input._ready === true to dismiss overlay
5. On script failure, index.html/shows error and sets Input._ready = true to prevent permanent input blocking
6. main.js failBoot() shows error message and sets Input._ready = true
7. main.js bootGame() sets Input._ready = true after successful scene registration

## Success Criteria
Upon completion, the game will:
1. Show loading overlay with "0% Loading engine" that updates as script groups load
2. Display current stage (Loading engine, Loading data, etc.) as groups finish
3. Automatically dismiss overlay when first frame renders and input is ready
4. Show error message (not infinite spinner) when critical script fails to load
5. Allow input processing/refresh after script failure (no permanent blocking)