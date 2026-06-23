import { getSkill } from './skill.js';

export function createHero(skillIds = []) {
  const hero = {
    name: 'Hero Alpha',
    hp: 100,
    maxHp: 100,
    speed: 50,
    accuracy: 0.5,
    critChance: 0.05,
    dodgeChance: 0.01,
    counterChance: 0.01,
    cloneChance: 0,
    shockChance: 0,
    freezeCharge: 0,
    trueHitCharge: 0,
    redirectChance: 0.01,
    isAlive: true,
    isHero: true,
    hunter: false,
    hasChainLightning: false,
    hasReflectChaos: false,
    hasShadowClone: false,
    frozenTurns: 0,
    skillIds: [...skillIds],
    statMods: {}
  };

  for (const id of skillIds) {
    const skill = getSkill(id);
    if (!skill) continue;
    if (skill.type === 'passive' && skill.apply) {
      skill.apply(hero);
    }
    if (skill.trigger === 'chainLightning') hero.hasChainLightning = true;
    if (skill.trigger === 'reflectChaos') hero.hasReflectChaos = true;
    if (skill.trigger === 'shadowClone') hero.hasShadowClone = true;
  }

  hero.hp = hero.maxHp;
  return hero;
}
