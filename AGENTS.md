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
| `src/engine/` | `battle-engine.js` (orchestrates turns, events, stats), `turn-manager.js` (speed-based turn queue), `damage-calculator.js` (hit/dodge/crit/counter checks) |
| `src/models/` | `hero.js` (factory + passive skill application), `enemy.js` (random stat gen), `skill.js` (11 skill definitions) |
| `src/systems/` | `skill-system.js` (battle-start / on-attack triggers), `effect-system.js` (targeting/end helpers), `stage-generator.js` (enemy waves per stage) |
| `src/ui/`     | `renderer.js` (DOM-based arena + HP bars), `battle-log.js` (scrolling event log renderer) |
| `src/`        | `app.js` (state machine: hero select → skill select → battle → result) |

## Game flow

1. **Hero Select** — confirms Hero Alpha (only option).
2. **Skill Select** — pick up to 4 of 11 skills from grid (tap to toggle).
3. **Battle** — auto-runs at 700ms/turn; arena shows HP bars, log streams events.
4. **Result** — displays winner, Total Damage, Crits, Dodges, Counters.
5. **Next Stage** (if won) increments stage (loops every 5 with scaling). **Retry** returns to skill select.

## Key mechanics

- **Turn order**: sorted by speed descending each round.
- **Accuracy**: `hitChance = attacker.accuracy - target.dodgeChance`.
- **Dodge**: separate check after hit — heroes can dodge enemy attacks.
- **Clones** (Shadow Clone): 5% chance at battle start. Enemies target clones first. Clones have 1 HP.
- **Freeze** (Frost Control): hero can skip one enemy's turn per charge.
- **True Strike**: auto-consume charge for guaranteed hit (bypasses accuracy/dodge).
- **Chain Lightning**: 5% on hero attack — 50% splash to other enemies.
- **Reflect Chaos**: 10% when hero is hit — takes 10%, reflects 90% to attacker.
- **Counter**: checked after taking damage. Hero can counter-attack.

## Developer commands

Open `http://localhost/html/clsg/` in a browser — no server-side processing needed.

> **Note:** The Laragon nginx root is `C:\laragon\www`; a directory junction links
> `C:\laragon\www\html\clsg` → `E:\laragon\www\html\clsg` so the project
> is served correctly. If the URL returns 404, recreate the junction.
