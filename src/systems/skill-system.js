import { SKILL_DATA } from '../constants/skill-data.js';

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function applyBattleStartSkills(hero) {
  const results = [];

  if (hero.hasShadowClone && Math.random() < SKILL_DATA.SHADOW_CLONE_CHANCE) {
    const cloneCount = randInt(SKILL_DATA.CLONE_COUNT_MIN, SKILL_DATA.CLONE_COUNT_MAX);
    const clones = [];
    for (let i = 0; i < cloneCount; i++) {
      clones.push({
        name: `Clone ${i + 1}`,
        hp: 1,
        maxHp: 1,
        dodgeChance: 0,
        isAlive: true,
        isClone: true,
        isHero: false
      });
    }
    results.push({ type: 'CLONE_CREATED', count: cloneCount, clones });
  }

  if (hero.skillIds.includes('frost-control')) {
    hero.freezeCharge = randInt(SKILL_DATA.FREEZE_CHARGE_MIN, SKILL_DATA.FREEZE_CHARGE_MAX);
    results.push({ type: 'FREEZE_CHARGE', count: hero.freezeCharge });
  }

  if (hero.skillIds.includes('true-strike')) {
    hero.trueHitCharge = randInt(SKILL_DATA.TRUE_HIT_CHARGE_MIN, SKILL_DATA.TRUE_HIT_CHARGE_MAX);
    results.push({ type: 'TRUE_HIT_CHARGE', count: hero.trueHitCharge });
  }

  return results;
}

export function checkOnAttack(actor, target, baseDamage, enemies) {
  const events = [];
  if (!actor.isHero || !actor.hasChainLightning) return events;
  if (Math.random() >= SKILL_DATA.CHAIN_LIGHTNING_CHANCE) return events;

  const isCombo = Math.random() < SKILL_DATA.CHAIN_COMBO_CHANCE;
  const splashRatio = isCombo ? SKILL_DATA.CHAIN_SPLASH_COMBO : SKILL_DATA.CHAIN_SPLASH_SOLO;
  const others = enemies.filter(e => e.isAlive && e !== target);
  for (const other of others) {
    const splash = Math.floor(baseDamage * splashRatio);
    other.hp -= splash;
    events.push({ type: 'CHAIN_LIGHTNING', target: other.name, damage: splash, combo: isCombo });
    if (other.hp <= 0) {
      other.isAlive = false;
      events.push({ type: 'DEATH', target: other.name });
    }
  }
  return events;
}

export function checkOnHitReceived(target, attacker, damage) {
  const events = [];
  if (!target.isHero || !target.hasReflectChaos) return events;
  if (Math.random() >= SKILL_DATA.REFLECT_CHANCE) return events;

  const isCombo = Math.random() < SKILL_DATA.REFLECT_COMBO_CHANCE;
  const reflected = Math.floor(damage * (isCombo ? SKILL_DATA.REFLECT_COMBO_SEND : SKILL_DATA.REFLECT_SOLO_SEND));
  const actual = Math.floor(damage * (isCombo ? SKILL_DATA.REFLECT_COMBO_TAKE : SKILL_DATA.REFLECT_SOLO_TAKE));
  target.hp -= actual - damage;
  attacker.hp -= reflected;
  events.push({ type: 'REFLECT_CHAOS', attacker: attacker.name, reflected, actual, combo: isCombo });
  if (attacker.hp <= 0) {
    attacker.isAlive = false;
    events.push({ type: 'DEATH', target: attacker.name });
  }
  return events;
}
