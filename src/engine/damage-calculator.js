export function calculateBaseDamage() {
  return 10 + Math.floor(Math.random() * 10) + 1;
}

export function checkHit(attacker, target, guaranteed) {
  if (guaranteed) return true;
  let hitChance = attacker.accuracy - target.dodgeChance;
  if (attacker.hunter) hitChance += 0.1;
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
