'use strict'

const {EntityFilter} = require('../gameEngine/entityComponentManager.js');

class Satiety {
    static of(max, declineRatePerSeconds) {
        return new Satiety(max, max, declineRatePerSeconds);
    }

    constructor(max, current, declineRatePerSeconds) {
        this.max = max;
        this.current = current;
        this.declineRatePerSeconds = declineRatePerSeconds;
    }
};
module.exports.Satiety = Satiety;

module.exports.SatietySystem = class SatietySystem {
    filter;
    constructor() {
        this.filter = new EntityFilter().all(Satiety);
    }

    update(groupName, world) {
        let elapsedTime = world.getGameLoop().getElapsedTime();
        for(let entity of world.getEntityComponentManager().select(this.filter)) {
            let satiety = entity.get(Satiety);
            satiety.current = Math.max(0, satiety.current - elapsedTime / 1000 / satiety.declineRatePerSeconds);
        }
    }
};