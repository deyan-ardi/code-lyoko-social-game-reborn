export class TurnManager {
  constructor() {
    this.queue = [];
    this.index = 0;
  }

  buildQueue(entities) {
    this.queue = entities.filter(e => e.isAlive).sort((a, b) => b.speed - a.speed);
    this.index = 0;
  }

  next() {
    if (this.index >= this.queue.length) {
      this.buildQueue(this.queue.concat([]));
    }
    if (this.queue.length === 0) return null;
    const actor = this.queue[this.index];
    this.index++;
    if (!actor.isAlive) return this.next();
    return actor;
  }
}
