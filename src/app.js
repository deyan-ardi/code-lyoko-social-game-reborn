import { createHero } from './models/hero.js';
import { SKILLS } from './models/skill.js';
import { generateStage } from './systems/stage-generator.js';
import { BattleEngine } from './engine/battle-engine.js';
import { BattleLog } from './ui/battle-log.js';
import { Renderer } from './ui/renderer.js';

let hero = null;
let selectedSkills = [];
let currentStage = 1;
let hpMultiplier = 1;
let battleEngine = null;
let eventQueue = [];
let eventTimer = null;
let currentBonusSkill = null;

const $ = id => document.getElementById(id);

const heroSelectEl = $('hero-select');
const skillSelectEl = $('skill-select');
const battleSectionEl = $('battle-section');
const resultSectionEl = $('result-section');
const bonusSectionEl = $('bonus-section');
const stageInfoEl = $('stage-info');
const heroInfoEl = $('hero-info');
const skillListEl = $('skill-list');
const selectedCountEl = $('selected-count');
const startBtn = $('start-btn');
const bonusSkillCardEl = $('bonus-skill-card');
const btnTakeSkill = $('btn-take-skill');
const btnSkipSkill = $('btn-skip-skill');

const battleLog = new BattleLog($('battle-log'));
const renderer = new Renderer(
  $('battle-arena'),
  $('hero-area'),
  $('enemies-area'),
  $('clones-area'),
  $('fx-layer')
);

function showSection(el) {
  [heroSelectEl, skillSelectEl, battleSectionEl, resultSectionEl, bonusSectionEl]
    .forEach(s => s.classList.add('hidden'));
  el.classList.remove('hidden');
}

function initHeroSelect() {
  heroInfoEl.innerHTML = `
    <div class="hero-card">
      <div class="entity-symbol">O</div>
      <h3>Hero Alpha</h3>
      <ul>
        <li>HP: ${Math.floor(100 * hpMultiplier)}</li>
        <li>Speed: 50</li>
        <li>Accuracy: 50%</li>
        <li>Crit: 5%</li>
        <li>Dodge: 1%</li>
        <li>Counter: 1%</li>
      </ul>
    </div>`;
  showSection(heroSelectEl);
}

$('confirm-hero').addEventListener('click', () => {
  initSkillSelect();
});

function initSkillSelect() {
  selectedSkills = [];
  selectedCountEl.textContent = '0 / 4';
  startBtn.disabled = true;
  skillListEl.innerHTML = '';

  for (const skill of SKILLS) {
    const card = document.createElement('div');
    card.className = 'skill-card';
    card.dataset.id = skill.id;
    card.innerHTML = `
      <div class="skill-name">${skill.name}</div>
      <div class="skill-desc">${skill.description}</div>
    `;
    card.addEventListener('click', () => toggleSkill(card, skill.id));
    skillListEl.appendChild(card);
  }

  showSection(skillSelectEl);
}

function toggleSkill(card, id) {
  const idx = selectedSkills.indexOf(id);
  if (idx >= 0) {
    selectedSkills.splice(idx, 1);
    card.classList.remove('selected');
  } else if (selectedSkills.length < 4) {
    selectedSkills.push(id);
    card.classList.add('selected');
  }
  selectedCountEl.textContent = `${selectedSkills.length} / 4`;
  startBtn.disabled = selectedSkills.length === 0;
}

startBtn.addEventListener('click', () => {
  startBattle();
});

function startBattle() {
  if (eventTimer) { clearTimeout(eventTimer); eventTimer = null; }
  eventQueue = []; pendingDamage = {};

  hero = createHero(selectedSkills, hpMultiplier);
  const enemies = generateStage(currentStage);
  battleEngine = new BattleEngine(hero, enemies);
  battleEngine.start();
  battleLog.clear();
  stageInfoEl.textContent = `Stage ${currentStage}`;
  showSection(battleSectionEl);
  renderer.render(hero, enemies, []);
  $('result-section').classList.add('hidden');

  processNextEvent();
}

let pendingDamage = {};

function findEntity(name) {
  if (hero && hero.name === name) return hero;
  for (const e of battleEngine.enemies) {
    if (e.name === name) return e;
  }
  for (const c of battleEngine.clones) {
    if (c.name === name) return c;
  }
  return null;
}

function buildPendingDamage(events) {
  const pending = {};
  for (const ev of events) {
    const dmg = ev.amount || ev.damage || 0;
    if (dmg && ev.target) {
      pending[ev.target] = (pending[ev.target] || 0) + dmg;
    }
  }
  return pending;
}

function processNextEvent() {
  if (eventQueue.length === 0) {
    const events = battleEngine.runTurn();
    if (!events) {
      showResult();
      return;
    }
    eventQueue = events.slice();
    pendingDamage = buildPendingDamage(eventQueue);
  }

  const ev = eventQueue.shift();
  battleLog.addEvents([ev]);

  const hpOverrides = {};
  for (const [name, total] of Object.entries(pendingDamage)) {
    if (total > 0) {
      const e = findEntity(name);
      if (e) hpOverrides[name] = e.hp + total;
    }
  }

  renderer.render(hero, battleEngine.enemies, battleEngine.clones, hpOverrides);
  renderer.animateEvent(ev);

  const dmg = ev.amount || ev.damage || 0;
  if (dmg && ev.target && pendingDamage[ev.target] !== undefined) {
    pendingDamage[ev.target] -= dmg;
    if (pendingDamage[ev.target] <= 0) delete pendingDamage[ev.target];
  }

  eventTimer = setTimeout(processNextEvent, eventDelay(ev));
}

function eventDelay(ev) {
  switch (ev.type) {
    case 'TURN_START': return 600;
    case 'ATTACK': case 'COUNTER': case 'REFLECT_CHAOS': return 900;
    case 'CRITICAL': return 1100;
    case 'DAMAGE': case 'CHAIN_LIGHTNING': return 500;
    case 'DEATH': case 'CLONE_DESTROYED': return 800;
    case 'VICTORY': case 'DEFEAT': return 1500;
    case 'DODGE': case 'MISS': return 600;
    default: return 400;
  }
}

function showResult() {
  showSection(resultSectionEl);
  const stats = battleEngine.getStats();
  const result = battleEngine.result;
  $('result-content').innerHTML = renderer.renderResult(result, stats);
  $('result-stage').textContent = `Stage ${currentStage}`;

  $('btn-retry').addEventListener('click', () => {
    initSkillSelect();
  }, { once: true });

  $('btn-next').addEventListener('click', () => {
    if (result === 'victory') {
      currentStage++;
      hpMultiplier *= 1.5;
      showBonusSkill();
    } else {
      startBattle();
    }
  }, { once: true });

  $('btn-next').disabled = result !== 'victory';
}

function showBonusSkill() {
  const available = SKILLS.filter(s => !selectedSkills.includes(s.id));
  if (available.length === 0) {
    startBattle();
    return;
  }

  currentBonusSkill = available[Math.floor(Math.random() * available.length)];

  bonusSkillCardEl.innerHTML = `
    <div class="skill-card selected">
      <div class="skill-name">${currentBonusSkill.name}</div>
      <div class="skill-desc">${currentBonusSkill.description}</div>
    </div>`;

  showSection(bonusSectionEl);

  btnTakeSkill.onclick = () => {
    selectedSkills.push(currentBonusSkill.id);
    startBattle();
  };

  btnSkipSkill.onclick = () => {
    startBattle();
  };
}

initHeroSelect();
