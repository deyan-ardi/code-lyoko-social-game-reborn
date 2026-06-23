import { getSkill } from './skill.js';
import { HERO_BASE } from '../constants/hero-data.js';

export function createHero(skillIds = [], hpMultiplier = 1) {
  const baseMaxHp = Math.floor(HERO_BASE.hp * hpMultiplier);
  const hero = {
    name: HERO_BASE.name,
    hp: baseMaxHp,
    maxHp: baseMaxHp,
    speed: HERO_BASE.speed,
    accuracy: HERO_BASE.accuracy,
    critChance: HERO_BASE.critChance,
    dodgeChance: HERO_BASE.dodgeChance,
    counterChance: HERO_BASE.counterChance,
    cloneChance: 0,
    shockChance: 0,
    freezeCharge: 0,
    trueHitCharge: 0,
    redirectChance: HERO_BASE.redirectChance,
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
