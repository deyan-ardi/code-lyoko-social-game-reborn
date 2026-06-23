export class Renderer {
  constructor(arenaEl, heroEl, enemiesEl, clonesEl) {
    this.arenaEl = arenaEl;
    this.heroEl = heroEl;
    this.enemiesEl = enemiesEl;
    this.clonesEl = clonesEl;
  }

  render(hero, enemies, clones) {
    this.renderEntity(this.heroEl, hero, 'O', 'hero-entity');
    this.renderEnemies(enemies);
    this.renderClones(clones);
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
  }
}
