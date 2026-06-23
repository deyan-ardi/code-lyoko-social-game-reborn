export class BattleLog {
  constructor(container) {
    this.container = container;
    this.entries = [];
  }

  clear() {
    this.entries = [];
    this.container.innerHTML = '';
  }

  addEvents(events) {
    for (const ev of events) {
      this.entries.push(ev);
      this.renderEvent(ev);
    }
    this.container.scrollTop = this.container.scrollHeight;
  }

  renderEvent(ev) {
    const el = document.createElement('div');
    el.className = 'log-entry log-' + ev.type.toLowerCase();

    switch (ev.type) {
      case 'TURN_START':
        el.textContent = `--- Turn ${ev.turn} ---`;
        break;
      case 'ACTOR':
        el.textContent = `${ev.name}'s turn`;
        break;
      case 'FROZEN':
        el.textContent = `${ev.target} is frozen, skips turn`;
        break;
      case 'FREEZE_USE':
        el.textContent = `${ev.source} uses Freeze Charge on ${ev.target}`;
        break;
      case 'ATTACK':
        el.textContent = `${ev.actor} attacks ${ev.target}`;
        break;
      case 'TRUE_HIT_USE':
        el.textContent = `${ev.actor} uses True Strike — guaranteed hit`;
        break;
      case 'MISS':
        el.textContent = `${ev.actor} attacks ${ev.target} — MISS`;
        break;
      case 'DODGE':
        el.textContent = `${ev.target} dodged the attack`;
        break;
      case 'CRITICAL':
        el.textContent = `CRITICAL HIT by ${ev.actor}`;
        break;
      case 'DAMAGE':
        el.textContent = `${ev.target} takes ${ev.amount} damage`;
        break;
      case 'CHAIN_LIGHTNING':
        el.textContent = `Chain Lightning hits ${ev.target} for ${ev.damage}`;
        break;
      case 'REFLECT_CHAOS':
        el.textContent = `Reflect Chaos: ${ev.target} takes ${ev.actual}, ${ev.attacker} takes ${ev.reflected}`;
        break;
      case 'COUNTER':
        el.textContent = `${ev.actor} COUNTERS ${ev.target} for ${ev.damage}`;
        break;
      case 'CLONE_CREATED':
        el.textContent = `Shadow Clone creates ${ev.count} clone(s)`;
        break;
      case 'CLONE_DESTROYED':
        el.textContent = `${ev.target} is destroyed`;
        break;
      case 'FREEZE_CHARGE':
        el.textContent = `Gained ${ev.count} Freeze Charge(s)`;
        break;
      case 'TRUE_HIT_CHARGE':
        el.textContent = `Gained ${ev.count} True Hit Charge(s)`;
        break;
      case 'DEATH':
        el.textContent = `${ev.target} has fallen`;
        break;
      case 'VICTORY':
        el.textContent = 'VICTORY! All enemies defeated.';
        el.style.fontWeight = 'bold';
        el.style.color = '#4caf50';
        break;
      case 'DEFEAT':
        el.textContent = 'DEFEAT... Hero has fallen.';
        el.style.fontWeight = 'bold';
        el.style.color = '#f44336';
        break;
      default:
        el.textContent = JSON.stringify(ev);
    }

    this.container.appendChild(el);
  }
}
