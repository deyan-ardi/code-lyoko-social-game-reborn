export function getFirstAliveEnemy(enemies) {
  return enemies.find(e => e.isAlive) || null;
}

export function getRandomAliveEnemy(enemies) {
  const alive = enemies.filter(e => e.isAlive);
  if (alive.length === 0) return null;
  return alive[Math.floor(Math.random() * alive.length)];
}

export function getFirstClone(clones) {
  return clones.find(c => c.isAlive) || null;
}

export function isBattleOver(hero, enemies) {
  if (!hero.isAlive) return 'defeat';
  if (enemies.every(e => !e.isAlive)) return 'victory';
  return null;
}
