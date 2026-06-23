let enemyCounter = 0;

export function createEnemy(stage = 1) {
  const scale = 1 + (stage - 1) * 0.05;
  enemyCounter++;
  return {
    name: `Enemy #${enemyCounter}`,
    hp: Math.floor(randomBetween(80, 120) * scale),
    maxHp: 0,
    speed: Math.floor(randomBetween(40, 60)),
    accuracy: randomBetween(0.4, 0.6),
    critChance: randomBetween(0, 0.1),
    dodgeChance: randomBetween(0, 0.1),
    counterChance: randomBetween(0, 0.1),
    isAlive: true,
    isHero: false,
    frozenTurns: 0
  };
}

export function resetEnemyCounter() {
  enemyCounter = 0;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
