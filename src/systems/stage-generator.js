import { createEnemy, resetEnemyCounter } from '../models/enemy.js';
import { getStageConfig } from '../constants/enemy-data.js';

export function generateStage(stageNumber) {
  resetEnemyCounter();
  const config = getStageConfig(stageNumber);
  const enemies = [];

  for (let i = 0; i < config.enemyCount; i++) {
    const enemy = createEnemy(stageNumber);
    if (config.isBoss) {
      enemy.name = `Boss #${i + 1}`;
      enemy.hp = Math.floor(enemy.hp * config.bossHpMul);
      enemy.speed = Math.floor(enemy.speed * config.bossSpeedMul);
    }
    enemy.maxHp = enemy.hp;
    enemies.push(enemy);
  }

  return enemies;
}
