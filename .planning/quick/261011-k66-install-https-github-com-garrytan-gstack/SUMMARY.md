---
quick_id: 261011-k66
status: complete
date: 2026-10-11
description: install https://github.com/garrytan/gstack
---

# Quick task 261011-k66: SUMMARY

## Result
Installed garrytan/gstack v1.91.83.0 for OpenCode host (experimental tier, global scope).

- Checkout: `~/gstack` (single-branch, depth-1 clone of https://github.com/garrytan/gstack.git)
- Setup: `./setup --host opencode --no-browser` — exit 0, "gstack ready (opencode)"
- Registry (`./setup --status`): opencode / experimental / global / current / 1.91.83.0 → `~/.config/opencode/skills`
- Install checks: router is a real file; 25 section links checked, all resolve
- Skills: `~/.config/opencode/skills/gstack*` (gstack, gstack-review, gstack-qa, gstack-ship, …)
- Commands: `~/.config/opencode/commands/gstack-*.md` (/gstack-office-hours, /gstack-review, …)
- Browse binary: `~/gstack/browse/dist/browse` present

## Deviations from upstream default
- Used `--host opencode` (we run in OpenCode) instead of the Claude-Code default path (`~/.claude/skills/gstack`).
- Used `--no-browser`: the full setup hung >7 min on the Chromium bootstrap in this environment, so Chromium was skipped. Browser-driven skills (/qa, /browse, /scrape, /benchmark, /canary, make-pdf, /diagram, /pair-agent) need it — re-run `cd ~/gstack && ./setup --host opencode` without the flag to add it later.

## Non-blocking notes from setup
- bun 1.4.0 vs tested 1.4.2 (warning only; floor is 1.3.3).
- CSO runtime images not preloaded (no local Docker socket); `/cso` runs static assessment only until Docker is available.
- Codex CLI not installed — outside reviews in /review, /ship, /autoplan need it.

## First move (per setup)
- New idea / empty repo: `/gstack-office-hours` or `/gstack-spec`
- Existing code: `/gstack-qa` or `/gstack-investigate`
- Keep current: `/gstack-upgrade` anytime
