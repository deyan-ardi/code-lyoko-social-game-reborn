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

  render(hero, enemies, clones, hpOverrides) {
    this.heroName = hero.name;
    this.enemyNames = enemies.filter(e => e.isAlive).map(e => e.name);
    this.cloneNames = clones.filter(c => c.isAlive).map(c => c.name);
    this.renderEntity(this.heroEl, hero, 'O', 'hero-entity', hpOverrides);
    this.renderEnemies(enemies, hpOverrides);
    this.renderClones(clones, hpOverrides);
  }

  isHero(name) { return name === this.heroName; }
  isEnemy(name) { return this.enemyNames.includes(name); }
  isClone(name) { return this.cloneNames.includes(name); }
  isHeroSide(name) { return this.isHero(name) || this.isClone(name); }

  entityPosition(name) {
    const arenaRect = this.arenaEl.getBoundingClientRect();
    const all = this.arenaEl.querySelectorAll('.entity');
    for (const e of all) {
      const ne = e.querySelector('.entity-name');
      if (ne && ne.textContent === name) {
        const r = e.getBoundingClientRect();
        const cx = r.left + r.width / 2 - arenaRect.left;
        return (cx / arenaRect.width) * 100;
      }
    }
    return 50;
  }

  renderEntity(el, entity, symbol, cls, hpOverrides) {
    if (!entity || !entity.isAlive) {
      el.innerHTML = '<div class="entity dead">✕</div>';
      return;
    }
    const displayHp = (hpOverrides && hpOverrides[entity.name] !== undefined) ? hpOverrides[entity.name] : entity.hp;
    const hpPct = Math.max(0, Math.floor((displayHp / entity.maxHp) * 100));
    el.innerHTML = `
      <div class="entity ${cls}">
        <div class="entity-symbol">${symbol}</div>
        <div class="entity-name">${entity.name}</div>
        <div class="hp-bar"><div class="hp-fill" style="width:${hpPct}%"></div></div>
        <div class="entity-hp">${displayHp} / ${entity.maxHp}</div>
      </div>`;
  }

  renderEnemies(enemies, hpOverrides) {
    this.enemiesEl.innerHTML = '';
    for (const enemy of enemies) {
      const div = document.createElement('div');
      this.renderEntity(div, enemy, 'X', 'enemy-entity', hpOverrides);
      this.enemiesEl.appendChild(div);
    }
  }

  renderClones(clones, hpOverrides) {
    this.clonesEl.innerHTML = '';
    if (!clones || clones.length === 0) return;
    for (const clone of clones) {
      if (!clone.isAlive) continue;
      const div = document.createElement('div');
      this.renderEntity(div, clone, 'C', 'clone-entity', hpOverrides);
      this.clonesEl.appendChild(div);
    }
  }

  animateEvent(ev) {
    const fx = this.fxLayer;
    const actorIsHero = this.isHeroSide(ev.actor);
    const targetIsHero = this.isHeroSide(ev.target);
    const pos = ev.target ? this.entityPosition(ev.target) : 50;
    const actorPos = ev.actor ? this.entityPosition(ev.actor) : 15;
    const posPct = `${pos}%`;
    const actorPct = `${actorPos}%`;
    let el;

    switch (ev.type) {
      case 'ATTACK': {
        const goRight = actorIsHero;
        el = document.createElement('div');
        el.className = goRight ? 'fx-projectile' : 'fx-projectile-reverse';
        el.textContent = goRight ? '• →' : '← •';
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;
      }

      case 'CRITICAL': {
        const goRight = actorIsHero;
        el = document.createElement('div');
        el.className = goRight ? 'fx-projectile-crit' : 'fx-projectile-crit-reverse';
        el.textContent = goRight ? '⚡ →' : '← ⚡';
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        this.showAt('CRITICAL!', 'fx-critical', '45%', 1200);
        break;
      }

      case 'DAMAGE':
        el = document.createElement('div');
        el.className = 'fx-impact';
        el.style.left = posPct;
        el.textContent = '*';
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        el = document.createElement('div');
        el.className = 'fx-damage';
        el.textContent = `-${ev.amount}`;
        el.style.left = posPct;
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        this.flashEntity(ev.target);
        break;

      case 'DODGE':
        el = document.createElement('div');
        el.className = 'fx-dodge';
        el.textContent = '~ MISS';
        el.style.left = posPct;
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;

      case 'MISS':
        el = document.createElement('div');
        el.className = 'fx-miss';
        el.textContent = '~';
        el.style.left = posPct;
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;

      case 'COUNTER':
        this.showAt('↩ COUNTER', 'fx-counter', '45%', 800);
        break;

      case 'REFLECT_CHAOS':
        this.showAt('↩ REFLECT', 'fx-reflect', '45%', 700);
        break;

      case 'FREEZE_USE':
        el = document.createElement('div');
        el.className = 'fx-freeze';
        el.textContent = '❄ FREEZE';
        el.style.left = posPct;
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;

      case 'FROZEN':
        el = document.createElement('div');
        el.className = 'fx-freeze';
        el.textContent = '❄';
        el.style.left = posPct;
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;

      case 'CLONE_CREATED':
        el = document.createElement('div');
        el.className = 'fx-clone';
        el.textContent = 'O O O';
        el.style.left = '20%';
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;

      case 'CLONE_DESTROYED':
        this.showAt('✕', 'fx-death', '20%', 700);
        break;

      case 'DEATH':
        el = document.createElement('div');
        el.className = 'fx-death';
        el.textContent = '✕';
        el.style.left = posPct;
        fx.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        break;

      case 'CHAIN_LIGHTNING':
        this.showAt('⚡ CHAIN', 'fx-critical', '60%', 800);
        break;

      case 'TRUE_HIT_USE':
        this.showAt('🎯 TRUE STRIKE', 'fx-true-hit', '45%', 800);
        break;

      case 'VICTORY':
        this.showAt('🏆 VICTORY!', 'fx-critical', '45%', 1500);
        break;

      case 'DEFEAT':
        this.showAt('💀 DEFEAT', 'fx-death', '45%', 1500);
        break;
    }
  }

  showAt(text, cls, left, duration) {
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
