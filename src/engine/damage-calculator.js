import { SKILL_DATA } from '../constants/skill-data.js';

const DAMAGE_MIN = 10;
const DAMAGE_MAX = 20;

export function calculateBaseDamage() {
  return Math.floor(Math.random() * (DAMAGE_MAX - DAMAGE_MIN + 1)) + DAMAGE_MIN;
}

export function checkHit(attacker, target, guaranteed) {
  if (guaranteed) return true;
  let hitChance = attacker.accuracy - target.dodgeChance;
  if (attacker.hunter) hitChance += SKILL_DATA.HUNTER_ACCURACY_BONUS;
  return Math.random() < hitChance;
}

export function checkCrit(attacker) {
  return Math.random() < attacker.critChance;
}

export function checkDodge(target, guaranteed) {
  if (guaranteed) return false;
  return Math.random() < target.dodgeChance;
}

export function checkCounter(target) {
  return Math.random() < target.counterChance;
}
