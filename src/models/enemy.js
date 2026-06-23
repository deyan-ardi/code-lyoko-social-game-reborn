import { ENEMY_STATS, CYCLE_SCALE } from '../constants/enemy-data.js';

let enemyCounter = 0;

export function createEnemy(stage = 1) {
  const cycle = Math.floor((stage - 1) / 5);
  const scale = Math.pow(CYCLE_SCALE, cycle);
  enemyCounter++;
  return {
    name: `Enemy #${enemyCounter}`,
    hp: Math.floor(rng(ENEMY_STATS.hp) * scale),
    maxHp: 0,
    speed: Math.floor(rng(ENEMY_STATS.speed)),
    accuracy: rng(ENEMY_STATS.accuracy),
    critChance: rng(ENEMY_STATS.critChance),
    dodgeChance: rng(ENEMY_STATS.dodgeChance),
    counterChance: rng(ENEMY_STATS.counterChance),
    isAlive: true,
    isHero: false,
    frozenTurns: 0
  };
}

export function resetEnemyCounter() {
  enemyCounter = 0;
}

function rng(range) {
  return Math.random() * (range.max - range.min) + range.min;
}
