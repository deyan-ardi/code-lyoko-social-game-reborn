export class Renderer {
  constructor(arenaEl, heroEl, enemiesEl, clonesEl, fxLayer) {
    this.arenaEl = arenaEl;
    this.heroEl = heroEl;
    this.enemiesEl = enemiesEl;
    this.clonesEl = clonesEl;
    this.fxLayer = fxLayer;
    this.heroName = '';
    this.enemyNames = [];
    this.cloneNames = [];
  }

  render(hero, enemies, clones) {
    this.heroName = hero.name;
    this.enemyNames = enemies.filter(e => e.isAlive).map(e => e.name);
    this.cloneNames = clones.filter(c => c.isAlive).map(c => c.name);
    this.renderEntity(this.heroEl, hero, 'O', 'hero-entity');
    this.renderEnemies(enemies);
    this.renderClones(clones);
  }

  isHero(name) {
    return name === this.heroName;
  }

  isEnemy(name) {
    return this.enemyNames.includes(name);
  }

  isClone(name) {
    return this.cloneNames.includes(name);
  }

  isHeroSide(name) {
    return this.isHero(name) || this.isClone(name);
  }

  renderEntity(el, entity, symbol, cls) {
    if (!entity || !entity.isAlive) {
      el.innerHTML = '<div class="entity dead">✕</div>';
      return;
    }
    const hpPct = Math.max(0, Math.floor((entity.hp / entity.maxHp) * 100));
    el.innerHTML = `
      <div class="entity ${cls}">
        <div class="entity-symbol">${symbol}</div>
        <div class="entity-name">${entity.name}</div>
        <div class="hp-bar"><div class="hp-fill" style="width:${hpPct}%"></div></div>
        <div class="entity-hp">${entity.hp} / ${entity.maxHp}</div>
      </div>`;
  }

  renderEnemies(enemies) {
    this.enemiesEl.innerHTML = '';
    for (const enemy of enemies) {
      const div = document.createElement('div');
      this.renderEntity(div, enemy, 'X', 'enemy-entity');
      this.enemiesEl.appendChild(div);
    }
  }

  renderClones(clones) {
    this.clonesEl.innerHTML = '';
    if (!clones || clones.length === 0) return;
    for (const clone of clones) {
      if (!clone.isAlive) continue;
      const div = document.createElement('div');
      this.renderEntity(div, clone, 'C', 'clone-entity');
      this.clonesEl.appendChild(div);
    }
  }

  animateEvent(ev) {
    const fx = this.fxLayer;
    const isHeroActor = this.isHero(ev.actor);
    const targetIsHero = this.isHeroSide(ev.target);
    const actorIsHero = this.isHeroSide(ev.actor);
    const actorSide = actorIsHero ? 'hero' : 'enemy';
    const targetSide = targetIsHero ? 'hero' : 'enemy';

    let el;

    switch (ev.type) {
      case 'ATTACK': {
        const goingRight = actorSide === 'hero';
        el = document.createElement('div');
        el.className = goingRight ? 'fx-projectile' : 'fx-projectile-reverse';
        el.textContent = goingRight ? '• →' : '← •';
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;
      }

      case 'CRITICAL': {
        const goingRight = actorIsHero;
        el = document.createElement('div');
        el.className = goingRight ? 'fx-projectile-crit' : 'fx-projectile-crit-reverse';
        el.textContent = goingRight ? '⚡ →' : '← ⚡';
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        this.showAt(null, 'CRITICAL!', 'fx-critical', '45%', 1200);
        break;
      }

      case 'DAMAGE': {
        const near = targetSide === 'hero' ? '25%' : '70%';
        el = document.createElement('div');
        el.className = 'fx-impact';
        el.style.left = near;
        el.textContent = '*';
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        el = document.createElement('div');
        el.className = 'fx-damage';
        el.textContent = `-${ev.amount}`;
        el.style.left = near;
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        this.flashEntity(ev.target);
        break;
      }

      case 'DODGE': {
        const near = this.isHeroSide(ev.target) ? '25%' : '70%';
        el = document.createElement('div');
        el.className = 'fx-dodge';
        el.textContent = '~ MISS';
        el.style.left = near;
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;
      }

      case 'MISS': {
        const near = targetSide === 'hero' ? '25%' : '70%';
        el = document.createElement('div');
        el.className = 'fx-miss';
        el.textContent = '~';
        el.style.left = near;
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;
      }

      case 'COUNTER':
        this.showAt(ev, '↩ COUNTER', 'fx-counter', '45%', 800);
        break;

      case 'REFLECT_CHAOS':
        this.showAt(ev, '↩ REFLECT', 'fx-reflect', '45%', 700);
        break;

      case 'FREEZE_USE': {
        const near = this.isHeroSide(ev.target) ? '25%' : '70%';
        el = document.createElement('div');
        el.className = 'fx-freeze';
        el.textContent = '❄ FREEZE';
        el.style.left = near;
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;
      }

      case 'FROZEN':
        el = document.createElement('div');
        el.className = 'fx-freeze';
        el.textContent = '❄';
        el.style.left = '50%';
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;

      case 'CLONE_CREATED': {
        el = document.createElement('div');
        el.className = 'fx-clone';
        el.textContent = 'O O O';
        el.style.left = '25%';
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;
      }

      case 'CLONE_DESTROYED':
        this.showAt(ev, '✕', 'fx-death', '25%', 700);
        break;

      case 'DEATH': {
        const near = this.isHeroSide(ev.target) ? '25%' : '70%';
        el = document.createElement('div');
        el.className = 'fx-death';
        el.textContent = '✕';
        el.style.left = near;
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;
      }

      case 'CHAIN_LIGHTNING':
        this.showAt(ev, '⚡ CHAIN', 'fx-critical', '60%', 800);
        break;

      case 'TRUE_HIT_USE':
        this.showAt(ev, '🎯 TRUE STRIKE', 'fx-true-hit', '45%', 800);
        break;

      case 'VICTORY':
        this.showAt(null, '🏆 VICTORY!', 'fx-critical', '45%', 1500);
        break;

      case 'DEFEAT':
        this.showAt(null, '💀 DEFEAT', 'fx-death', '45%', 1500);
        break;
    }
  }

  showAt(ev, text, cls, left, duration) {
    const el = document.createElement('div');
    el.className = cls;
    el.textContent = text;
    el.style.left = left;
    el.style.animationDuration = `${duration}ms`;
    this.fxLayer.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  flashEntity(name) {
    const allEntities = this.arenaEl.querySelectorAll('.entity');
    for (const e of allEntities) {
      const nameEl = e.querySelector('.entity-name');
      if (nameEl && nameEl.textContent === name) {
        e.classList.remove('hit');
        void e.offsetWidth;
        e.classList.add('hit');
        e.addEventListener('animationend', () => e.classList.remove('hit'), { once: true });
      }
    }
  }

  renderResult(result, stats) {
    const isVictory = result === 'victory';
    return `
      <h2>${isVictory ? 'VICTORY!' : 'DEFEAT'}</h2>
      <div class="stats">
        <p>Total Damage: ${stats.totalDamage}</p>
        <p>Critical Hits: ${stats.crits}</p>
        <p>Dodges: ${stats.dodges}</p>
        <p>Counters: ${stats.counters}</p>
      </div>`;
  }

  clearBattle() {
    this.heroEl.innerHTML = '';
    this.enemiesEl.innerHTML = '';
    this.clonesEl.innerHTML = '';
    this.fxLayer.innerHTML = '';
  }
}
