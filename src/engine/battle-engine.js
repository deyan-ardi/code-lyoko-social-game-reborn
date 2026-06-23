import { TurnManager } from './turn-manager.js';
import { calculateBaseDamage, checkHit, checkCrit, checkDodge, checkCounter } from './damage-calculator.js';
import { applyBattleStartSkills, checkOnAttack } from '../systems/skill-system.js';
import { getFirstAliveEnemy, getRandomAliveEnemy, getFirstClone, isBattleOver } from '../systems/effect-system.js';

export class BattleEngine {
  constructor(hero, enemies) {
    this.hero = hero;
    this.enemies = enemies;
    this.clones = [];
    this.turnManager = new TurnManager();
    this.events = [];
    this.turnNumber = 0;
    this.stats = { totalDamage: 0, crits: 0, dodges: 0, counters: 0 };
    this.over = false;
    this.result = null;
  }

  start() {
    const skillResults = applyBattleStartSkills(this.hero);
    for (const r of skillResults) {
      if (r.type === 'CLONE_CREATED') this.clones.push(...r.clones);
      this.events.push(r);
    }
    this.turnManager.buildQueue([this.hero, ...this.enemies]);
  }

  runTurn() {
    if (this.over) return null;

    this.turnNumber++;
    const ev = [{ type: 'TURN_START', turn: this.turnNumber }];

    const actor = this.turnManager.next();
    if (!actor) return this.endBattle(ev);

    ev.push({ type: 'ACTOR', name: actor.name });

    if (actor.frozenTurns > 0) {
      actor.frozenTurns--;
      ev.push({ type: 'FROZEN', target: actor.name });
      return this.finalize(ev);
    }

    const target = this.resolveTarget(actor);
    if (!target) return this.finalize(ev);

    if (this.tryFreeze(actor, target, ev)) return this.finalize(ev);

    ev.push({ type: 'ATTACK', actor: actor.name, target: target.name });
    const guaranteed = actor.isHero && this.hero.trueHitCharge > 0 ? (this.hero.trueHitCharge--, true) : false;

    if (guaranteed) ev.push({ type: 'TRUE_HIT_USE', actor: actor.name });

    if (this.tryMiss(actor, target, guaranteed, ev)) return this.finalize(ev);
    if (this.tryDodge(actor, target, guaranteed, ev)) return this.finalize(ev);

    let damage = calculateBaseDamage();
    if (checkCrit(actor)) {
      damage *= 2;
      if (actor.isHero) this.stats.crits++;
      ev.push({ type: 'CRITICAL', actor: actor.name });
    }

    if (target.isHero && this.hero.hasReflectChaos && Math.random() < 0.1) {
      this.handleReflect(actor, target, damage, ev);
    } else {
      this.applyDamage(actor, target, damage, ev);
    }

    if (actor.isHero) {
      const chainEv = checkOnAttack(actor, target, damage, this.enemies);
      for (const e of chainEv) {
        if (e.type === 'DAMAGE' || e.type === 'CHAIN_LIGHTNING') {
          this.stats.totalDamage += e.damage || 0;
        }
      }
      ev.push(...chainEv);
    }

    const status = isBattleOver(this.hero, this.enemies);
    if (status) {
      this.over = true;
      this.result = status;
      ev.push({ type: status === 'victory' ? 'VICTORY' : 'DEFEAT' });
    }

    return this.finalize(ev);
  }

  resolveTarget(actor) {
    if (actor.isHero) {
      return getRandomAliveEnemy(this.enemies);
    }
    const clone = getFirstClone(this.clones);
    return (clone && clone.isAlive) ? clone : this.hero;
  }

  tryFreeze(actor, target, ev) {
    if (!actor.isHero || this.hero.freezeCharge < 1 || target.isClone) return false;
    this.hero.freezeCharge--;
    target.frozenTurns = 1;
    ev.push({ type: 'FREEZE_USE', source: actor.name, target: target.name });
    return true;
  }

  tryMiss(actor, target, guaranteed, ev) {
    if (checkHit(actor, target, guaranteed)) return false;
    ev.push({ type: 'MISS', actor: actor.name, target: target.name });
    return true;
  }

  tryDodge(actor, target, guaranteed, ev) {
    if (!checkDodge(target, guaranteed)) return false;
    ev.push({ type: 'DODGE', target: target.name });
    if (target.isHero) this.stats.dodges++;
    return true;
  }

  handleReflect(actor, target, damage, ev) {
    const reflected = Math.floor(damage * 0.9);
    const actual = Math.floor(damage * 0.1);
    target.hp -= actual;
    actor.hp -= reflected;
    this.stats.totalDamage += reflected;
    ev.push({ type: 'REFLECT_CHAOS', target: target.name, attacker: actor.name, reflected, actual });
    this.checkDeath(actor, ev);

    if (target.isAlive && checkCounter(target)) {
      const counterDmg = calculateBaseDamage();
      actor.hp -= counterDmg;
      this.stats.counters++;
      ev.push({ type: 'COUNTER', actor: target.name, target: actor.name, damage: counterDmg });
      this.checkDeath(actor, ev);
    }
  }

  applyDamage(actor, target, damage, ev) {
    target.hp -= damage;
    if (actor.isHero) this.stats.totalDamage += damage;
    ev.push({ type: 'DAMAGE', target: target.name, amount: damage });

    if (target.hp <= 0) {
      target.isAlive = false;
      ev.push({ type: target.isClone ? 'CLONE_DESTROYED' : 'DEATH', target: target.name });
      return;
    }

    if (!target.isClone && checkCounter(target)) {
      this.handleCounter(target, actor, ev);
    }
  }

  handleCounter(counterAttacker, originalAttacker, ev) {
    const counterDmg = calculateBaseDamage();

    if (originalAttacker.isHero && this.hero.hasReflectChaos && Math.random() < 0.1) {
      const actual = Math.floor(counterDmg * 0.1);
      const reflected = Math.floor(counterDmg * 0.9);
      originalAttacker.hp -= actual;
      counterAttacker.hp -= reflected;
      this.stats.totalDamage += reflected;
      ev.push({ type: 'REFLECT_CHAOS', target: originalAttacker.name, attacker: counterAttacker.name, reflected, actual });
      this.checkDeath(counterAttacker, ev);
    } else {
      originalAttacker.hp -= counterDmg;
      if (counterAttacker.isHero) this.stats.counters++;
      ev.push({ type: 'COUNTER', actor: counterAttacker.name, target: originalAttacker.name, damage: counterDmg });
      this.checkDeath(originalAttacker, ev);
    }
  }

  checkDeath(entity, ev) {
    if (entity.hp <= 0) {
      entity.isAlive = false;
      ev.push({ type: 'DEATH', target: entity.name });
    }
  }

  endBattle(ev) {
    this.over = true;
    this.result = isBattleOver(this.hero, this.enemies) || 'defeat';
    ev.push({ type: this.result === 'victory' ? 'VICTORY' : 'DEFEAT' });
    return this.finalize(ev);
  }

  finalize(ev) {
    this.events.push(...ev);
    return ev;
  }

  getAllEvents() { return this.events; }
  getStats() { return { ...this.stats }; }
}
