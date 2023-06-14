'use strict'

module.exports.Thirst = class Thirst {
    constructor(max, start, declineRatePerSeconds) {
        this.max = max;
        this.current = start;
        this.declineRatePerSeconds = declineRatePerSeconds;
    }
}

module.exports.Satiety = class Satiety {
    constructor(max, start, declineRatePerSeconds) {
        this.max = max;
        this.current = start;
        this.declineRatePerSeconds = declineRatePerSeconds;
    }
}

module.exports.Disease = class Disease {
    constructor(probability, probabilityRatePerSeconds, maxHealth, declineRatePerSeconds) {
        this.probability = probability;
        this.probabilityRatePerSeconds = probabilityRatePerSeconds;
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.declineRatePerSeconds = declineRatePerSeconds;
    }
}

module.exports.GrowTimer = class GrowTimer {
    constructor(growStateName, timeInSeconds) {
        this.growStateName = growStateName;
        this.timeInSeconds = timeInSeconds;
    }
}

module.exports.VegatableMeta = class VegatableMeta {
    constructor(name, life) {
        this.name = name;
        this.life = life;
    }
}

module.exports.PotatoGhost = class PotatoGhost {
    constructor(timeInSeconds) {
        this.timeInSeconds = timeInSeconds;
    }
}