export const SKILLS = [
  {
    id: 'quick-reflex',
    name: 'Quick Reflex',
    description: 'Speed +10',
    type: 'passive',
    apply(hero) { hero.speed += 10; }
  },
  {
    id: 'agile',
    name: 'Agile',
    description: 'Dodge +10%',
    type: 'passive',
    apply(hero) { hero.dodgeChance += 0.1; }
  },
  {
    id: 'counter-master',
    name: 'Counter Master',
    description: 'Counter +10%',
    type: 'passive',
    apply(hero) { hero.counterChance += 0.1; }
  },
  {
    id: 'shadow-clone',
    name: 'Shadow Clone',
    description: '5% chance battle start: 1-3 clones (HP=1)',
    type: 'battleStart',
    trigger: 'shadowClone'
  },
  {
    id: 'chain-lightning',
    name: 'Chain Lightning',
    description: '5% chance on attack: splash 50% damage to other enemies',
    type: 'onAttack',
    trigger: 'chainLightning'
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Accuracy +10%, Crit +10%',
    type: 'passive',
    apply(hero) { hero.accuracy += 0.1; hero.critChance += 0.1; }
  },
  {
    id: 'hunter',
    name: 'Hunter',
    description: 'Reduce enemy dodge by 10%',
    type: 'passive',
    apply(hero) { hero.hunter = true; }
  },
  {
    id: 'frost-control',
    name: 'Frost Control',
    description: 'Battle start: gain 1-3 Freeze Charges (skip enemy turn)',
    type: 'battleStart',
    trigger: 'frostControl'
  },
  {
    id: 'true-strike',
    name: 'True Strike',
    description: 'Battle start: gain 1-3 True Hit Charges (guaranteed hit)',
    type: 'battleStart',
    trigger: 'trueStrike'
  },
  {
    id: 'reflect-chaos',
    name: 'Reflect Chaos',
    description: '10% chance on hit: reflect 90% damage back, take 10%',
    type: 'onHit',
    trigger: 'reflectChaos'
  },
  {
    id: 'vitality',
    name: 'Vitality',
    description: 'HP +10',
    type: 'passive',
    apply(hero) { hero.maxHp += 10; hero.hp += 10; }
  }
];

export function getSkill(id) {
  return SKILLS.find(s => s.id === id);
}
