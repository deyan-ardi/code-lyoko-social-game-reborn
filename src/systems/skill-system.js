export function applyBattleStartSkills(hero) {
  const results = [];

  if (hero.hasShadowClone && Math.random() < 0.05) {
    const cloneCount = 1 + Math.floor(Math.random() * 3);
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
    hero.freezeCharge = 1 + Math.floor(Math.random() * 3);
    results.push({ type: 'FREEZE_CHARGE', count: hero.freezeCharge });
  }

  if (hero.skillIds.includes('true-strike')) {
    hero.trueHitCharge = 1 + Math.floor(Math.random() * 3);
    results.push({ type: 'TRUE_HIT_CHARGE', count: hero.trueHitCharge });
  }

  return results;
}

export function checkOnAttack(actor, target, baseDamage, enemies) {
  const events = [];
  if (actor.isHero && actor.hasChainLightning && Math.random() < 0.05) {
    const others = enemies.filter(e => e.isAlive && e !== target);
    for (const other of others) {
      const splash = Math.floor(baseDamage * 0.5);
      other.hp -= splash;
      events.push({ type: 'CHAIN_LIGHTNING', target: other.name, damage: splash });
      if (other.hp <= 0) {
        other.isAlive = false;
        events.push({ type: 'DEATH', target: other.name });
      }
    }
  }
  return events;
}

export function checkOnHitReceived(target, attacker, damage) {
  const events = [];
  if (target.isHero && target.hasReflectChaos && Math.random() < 0.1) {
    const reflected = Math.floor(damage * 0.9);
    const actual = Math.floor(damage * 0.1);
    target.hp -= actual - damage;
    attacker.hp -= reflected;
    events.push({ type: 'REFLECT_CHAOS', attacker: attacker.name, reflected, actual });
    if (attacker.hp <= 0) {
      attacker.isAlive = false;
      events.push({ type: 'DEATH', target: attacker.name });
    }
  }
  return events;
}
