export const ENEMY_STATS = {
  hp: { min: 80, max: 120 },
  speed: { min: 40, max: 60 },
  accuracy: { min: 0.4, max: 0.6 },
  critChance: { min: 0, max: 0.1 },
  dodgeChance: { min: 0, max: 0.1 },
  counterChance: { min: 0, max: 0.1 }
};

export const CYCLE_SCALE = 1.5;

export const STAGE_LAYOUT = [
  { enemyCount: 1, isBoss: false },
  { enemyCount: 2, isBoss: false },
  { enemyCount: 3, isBoss: false },
  { enemyCount: 3, isBoss: false },
  { enemyCount: 1, isBoss: true, bossHpMul: 3, bossSpeedMul: 3 }
];

export function getStageConfig(stage) {
  const cycleIndex = Math.floor((stage - 1) / 5);
  const stageInCycle = (stage - 1) % 5;
  const layout = { ...STAGE_LAYOUT[stageInCycle] };
  layout.cycle = cycleIndex;
  layout.scale = Math.pow(CYCLE_SCALE, cycleIndex);
  return layout;
}
