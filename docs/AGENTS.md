# CLSG — Code Lyoko Social Game (Battle Prototype MVP)

**Greenfield project.** The only source of truth is `MVP1.md` (Indonesian-language spec).

## State

- Working MVP prototype implemented. All code lives in `src/`.
- No package manager, no build tooling, no tests, no CI, no git repo.
- Served locally via Laragon at `http://localhost/html/clsg/`.
- Source of truth: `MVP1.md` (Indonesian-language spec).

## Architecture

- **Vanilla HTML / CSS / JS** (ES modules) — no framework.
- Battle engine separated from UI via event-log replay system.
- All state lives in browser memory (no persistence).

| Directory   | Contents |
|-------------|----------|
| `src/constants/` | `hero-data.js` (HERO_BASE stats), `enemy-data.js` (ENEMY_STATS, CYCLE_SCALE, STAGE_LAYOUT) |
| `src/engine/` | `battle-engine.js` (orchestrates turns, events, stats), `turn-manager.js` (speed-based turn queue), `damage-calculator.js` (hit/dodge/crit/counter checks, DAMAGE_MIN/MAX) |
| `src/models/` | `hero.js` (factory + passive skill application), `enemy.js` (random stat gen using CYCLE_SCALE), `skill.js` (11 skill definitions) |
| `src/systems/` | `skill-system.js` (battle-start / on-attack triggers), `effect-system.js` (targeting/end helpers), `stage-generator.js` (enemy waves per stage) |
| `src/ui/`     | `renderer.js` (DOM-based arena + HP bars + FX layer), `battle-log.js` (scrolling event log renderer) |
| `src/`        | `app.js` (state machine + event queue + pendingDamage/pendingDeath display sync) |

## Key constraints

- **Engine is pure JS** — zero DOM/browser dependency. All engine files (`src/engine/`, `src/models/`, `src/systems/`) use only `Math.*`, arrays, objects, and ES module imports. They run in any JS runtime without browser APIs.
- **UI reads events only** — `BattleEngine.runTurn()` returns an array of event objects. UI (`renderer.js`, `battle-log.js`) never calls engine setters or modifies battle state directly.
- **Per-event delays** — `app.js` processes events one-at-a-time via `setTimeout`; delay varies by event type (see **Event Delays** table below).
- **CSS-animated FX layer** — `renderer.js` creates temporary DOM elements in `#fx-layer` for each event type (projectile, impact, damage float, dodge swoosh, counter arrow, freeze crystal, death fade). Animations are pure CSS keyframes; elements self-remove via `animationend`.

## Animation timing (pendingDamage / pendingDeath)

To prevent HP bars from updating **before** their corresponding animations play:

- At the start of each turn, `buildPending()` scans the entire event queue and computes:
  - `pendingDamage`: sum of all `amount`/`damage` values per entity.
  - `pendingDeath`: entities that will die in this turn.
- For **every event** (TURN_START, ACTOR, ATTACK, etc.), the renderer adds back all pending damage to HP bars, showing pre-damage values.
- When a DAMAGE event is animated: the entity still shows pre-damage HP; pending damage is subtracted **after** the animation completes (on the next event's render).
- When a DEATH event fires: the entity remains "alive" in the DOM with **0 HP** (via `pendingDeath`), the death animation plays, and the entity shows as dead "✕" on the next event after the delay.

This ensures the visual sequence is always:
1. Projectile flies while target HP is still full.
2. Impact + damage float while target HP is still pre-damage.
3. HP drops to real value.
4. (If fatal) entity shows 0 HP while skull animates.
5. Entity shows "✕" dead.

## Event Delays

Each event type has a specific delay instead of a fixed interval:

| Event Type         | Delay  |
|--------------------|--------|
| ACTOR              | 400ms  |
| TURN_START         | 600ms  |
| DODGE / MISS       | 600ms  |
| DEATH / CLONE_DESTROYED | 800ms |
| ATTACK / COUNTER / REFLECT_CHAOS | 900ms |
| CRITICAL           | 1100ms |
| DAMAGE / CHAIN_LIGHTNING | 500ms |
| VICTORY / DEFEAT   | 1500ms |
| Others             | 400ms  |

## Game flow

1. **Hero Select** — shows Hero Alpha stats read from `HERO_BASE` constant. Click Confirm.
2. **Skill Select** — pick up to 4 of 11 skills from grid (tap to toggle). Click Start.
3. **Battle** — auto-runs events sequentially at per-event delays; arena shows synced HP bars, log streams events.
4. **Result** — displays winner, Total Damage, Crits, Dodges, Counters.
5. **Next Stage** (if won) increments stage, scales hero HP ×1.5, restores HP full, then offers **2 random unselected skills** as clickable cards. Pick one or Skip. **Retry** returns to skill select.

### Bonus Skill Selection

- After each stage victory, `showBonusSkill()` picks up to 2 random skills from those not yet owned.
- Both are displayed as styled cards. Click one to add it, or click Skip.
- If only 1 skill remains unowned, only 1 card appears.
- If all 11 skills are owned, the bonus screen is skipped automatically.
- Bonus skills have no max limit (initial cap is 4).

## Constants usage

All tuning values are centralized:

| File | Constants | Used by |
|------|-----------|---------|
| `src/constants/hero-data.js` | HERO_BASE (hp, speed, accuracy, critChance, dodgeChance, counterChance) | `hero.js`, `app.js` (hero select display) |
| `src/constants/enemy-data.js` | ENEMY_STATS (hp/speed/accuracy ranges), CYCLE_SCALE (1.5), STAGE_LAYOUT (5 entries) | `enemy.js`, `stage-generator.js` |
| `src/engine/damage-calculator.js` | DAMAGE_MIN (10), DAMAGE_MAX (20) | Internal damage formula |

## Key mechanics

- **Turn order**: sorted by speed descending each round.
- **Targeting**: hero picks a random alive enemy each turn; enemies target clones first, then hero.
- **Accuracy**: `hitChance = attacker.accuracy - target.dodgeChance`.
- **Dodge**: separate check after hit — heroes can dodge enemy attacks.
- **Damage formula**: base = Random(10–20); crit doubles final.
- **Clones** (Shadow Clone): 5% chance at battle start. Enemies target clones first. Clones have 1 HP.
- **Freeze** (Frost Control): hero can skip one enemy's turn per charge.
- **True Strike**: auto-consume charge for guaranteed hit (bypasses accuracy/dodge).
- **Chain Lightning**: 5% on hero attack — 50% splash to other enemies.
- **Reflect Chaos**: 10% when hero is hit — takes 10%, reflects 90% to attacker.
- **Counter**: checked after taking damage. Hero can counter-attack.
- **Hero scaling**: after each victory, max HP ×1.5 (compound), HP restored to full.
- **Enemy scaling**: per cycle (5 stages): base HP range ×CYCLE_SCALE each cycle.

## Developer commands

Open `http://localhost/html/clsg/` in a browser — no server-side processing needed.

> **Note:** The Laragon nginx root is `C:\laragon\www`; a directory junction links
> `C:\laragon\www\html\clsg` → `E:\laragon\www\html\clsg` so the project
> is served correctly. If the URL returns 404, recreate the junction.
