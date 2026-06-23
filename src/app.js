import { createHero } from './models/hero.js';
import { SKILLS } from './models/skill.js';
import { generateStage } from './systems/stage-generator.js';
import { BattleEngine } from './engine/battle-engine.js';
import { BattleLog } from './ui/battle-log.js';
import { Renderer } from './ui/renderer.js';

const STATE = { HERO_SELECT: 0, SKILL_SELECT: 1, BATTLE: 2, RESULT: 3 };
let currentState = STATE.HERO_SELECT;
let hero = null;
let selectedSkills = [];
let currentStage = 1;
let battleEngine = null;
let battleInterval = null;

const $ = id => document.getElementById(id);

const heroSelectEl = $('hero-select');
const skillSelectEl = $('skill-select');
const battleSectionEl = $('battle-section');
const resultSectionEl = $('result-section');
const stageInfoEl = $('stage-info');
const heroInfoEl = $('hero-info');
const skillListEl = $('skill-list');
const selectedCountEl = $('selected-count');
const startBtn = $('start-btn');

const battleLog = new BattleLog($('battle-log'));
const renderer = new Renderer(
  $('battle-arena'),
  $('hero-area'),
  $('enemies-area'),
  $('clones-area')
);

function showSection(el) {
  [heroSelectEl, skillSelectEl, battleSectionEl, resultSectionEl].forEach(s => s.classList.add('hidden'));
  el.classList.remove('hidden');
}

function initHeroSelect() {
  heroInfoEl.innerHTML = `
    <div class="hero-card">
      <div class="entity-symbol">O</div>
      <h3>Hero Alpha</h3>
      <ul>
        <li>HP: 100</li>
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
  hero = createHero(selectedSkills);
  const enemies = generateStage(currentStage);
  battleEngine = new BattleEngine(hero, enemies);
  battleEngine.start();
  battleLog.clear();
  stageInfoEl.textContent = `Stage ${currentStage}`;
  showSection(battleSectionEl);
  renderer.render(hero, enemies, []);
  $('result-section').classList.add('hidden');

  battleInterval = setInterval(() => {
    const events = battleEngine.runTurn();
    if (!events) {
      clearInterval(battleInterval);
      battleInterval = null;
      showResult();
      return;
    }
    battleLog.addEvents(events);
    renderer.render(hero, battleEngine.enemies, battleEngine.clones);
  }, 700);
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
    if (result === 'victory') currentStage++;
    startBattle();
  }, { once: true });

  $('btn-next').disabled = result !== 'victory';
}

initHeroSelect();
