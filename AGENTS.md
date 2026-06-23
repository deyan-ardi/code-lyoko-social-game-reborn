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
| `src/engine/` | `battle-engine.js` (orchestrates turns, events, stats), `turn-manager.js` (speed-based turn queue), `damage-calculator.js` (hit/dodge/crit/counter checks) |
| `src/models/` | `hero.js` (factory + passive skill application), `enemy.js` (random stat gen), `skill.js` (11 skill definitions) |
| `src/systems/` | `skill-system.js` (battle-start / on-attack triggers), `effect-system.js` (targeting/end helpers), `stage-generator.js` (enemy waves per stage) |
| `src/ui/`     | `renderer.js` (DOM-based arena + HP bars), `battle-log.js` (scrolling event log renderer) |
| `src/`        | `app.js` (state machine: hero select → skill select → battle → result) |

## Key constraints

- **Engine is pure JS** — zero DOM/browser dependency. All engine files (`src/engine/`, `src/models/`, `src/systems/`) use only `Math.*`, arrays, objects, and ES module imports. They run in any JS runtime without browser APIs.
- **UI reads events only** — `BattleEngine.runTurn()` returns an array of event objects. UI (`renderer.js`, `battle-log.js`) never calls engine setters or modifies battle state directly.
- **Per-event delays** — `app.js` processes events one-at-a-time via `setTimeout`; delay varies by event type (400–1500ms) rather than a fixed per-turn interval.
- **CSS-animated FX layer** — `renderer.js` creates temporary DOM elements in `#fx-layer` for each event type (projectile, impact, damage float, dodge swoosh, counter arrow, freeze crystal, death fade). Animations are pure CSS keyframes; elements self-remove via `animationend`.

## Game flow

1. **Hero Select** — confirms Hero Alpha (only option).
2. **Skill Select** — pick up to 4 of 11 skills from grid (tap to toggle).
3. **Battle** — auto-runs at variable per-event delays; arena shows HP bars, log streams events.
4. **Result** — displays winner, Total Damage, Crits, Dodges, Counters.
5. **Next Stage** (if won) increments stage, scales hero HP ×1.5, restores HP full, then offers 1 random unselected bonus skill. **Retry** returns to skill select.

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
- **Enemy scaling**: per cycle (5 stages): base HP range ×1.5 each cycle.

## Developer commands

Open `http://localhost/html/clsg/` in a browser — no server-side processing needed.

> **Note:** The Laragon nginx root is `C:\laragon\www`; a directory junction links
> `C:\laragon\www\html\clsg` → `E:\laragon\www\html\clsg` so the project
> is served correctly. If the URL returns 404, recreate the junction.
