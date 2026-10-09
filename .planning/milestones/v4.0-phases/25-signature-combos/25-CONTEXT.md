# Phase 25: Signature Combos - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Every hero unlocks one signature duo skill at Legend tier (90). Each combo scales with the hero's build (role stat + equipped state) and consumes both participants' turns. Each combo must preserve Phase 14 combat readability; any combo that breaks band separation is cut or reworked, not shipped.

</domain>

<decisions>
## Implementation Decisions

### Roster
- All five heroes get one combo each (user override of pilot-first): Hanuman Mountain-Leap follow-up, Arjuna precision duo strike, Bhima intercepting slam, Karna burst volley, Draupadi warding aegis. Names/flavor at implementer's discretion within respectful mythological tone.

### Build Scaling
- Combo potency scales with the hero's role stat (including tier passive) and equipped weapon level; unarmed/low-tier heroes get the base effect only.

### Cost
- Both act: using a duo skill consumes the current turns of both participants. Big payoff, real cost.

### Readability Gate
- Each combo renders inside existing intent/log/result bands (no new visual layer); Phase 14 `combat_readability` contracts must keep passing. Fail the gate → cut the combo's flair, keep a plain bonus.

### OpenCode's Discretion
- Exact formulas, log lines, and Toast copy per combo.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 24 `combatBonusFor`/synergy hooks in `performAttack`; `BondSystem.tierFor` Legend gate.
- Combat intent/log/result bands; feedback Toasts; `EquipmentSystem` weapon levels.

### Established Patterns
- Canonical combat authority; clones-only mutation; exactly-once unlock flags (`combo_<hero>` on first Legend reach or first use — discretion).
- Semantic tokens; reduced motion.

### Integration Points
- Combat action menu (duo option appears only at Legend + both participants able), intent display, result log, save flags.

</code>

<specifics>
## Specific Ideas

No specific requirements beyond the five-combo roster and build-scaling rule above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
