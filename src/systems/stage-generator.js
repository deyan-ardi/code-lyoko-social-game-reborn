import { createEnemy, resetEnemyCounter } from '../models/enemy.js';

export function generateStage(stageNumber) {
  resetEnemyCounter();

  const cycle = Math.floor((stageNumber - 1) / 5);
  const stageInCycle = ((stageNumber - 1) % 5) + 1;
  const enemyCount = stageInCycle === 5 ? 1 : stageInCycle;
  const enemies = [];

  for (let i = 0; i < enemyCount; i++) {
    const enemy = createEnemy(stageNumber);
    if (stageInCycle === 5) {
      enemy.name = `Boss #${i + 1}`;
      enemy.hp = Math.floor(enemy.hp * 2);
      enemy.speed = Math.floor(enemy.speed * 1.2);
    }
    enemy.maxHp = enemy.hp;
    enemies.push(enemy);
  }

  return enemies;
}
