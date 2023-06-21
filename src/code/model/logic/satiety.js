'use strict'

const {EntityFilter} = require('../gameEngine/entityComponentManager.js');

class Satiety {
    constructor(max, declineRatePerSeconds) {
        this.max = max;
        this.current = max;
        this.declineRatePerSeconds = declineRatePerSeconds;
    }
};
module.exports.Satiety = Satiety;

let filter = new EntityFilter().all(Satiety);
module.exports.SatietySystem = class SatietySystem {
    update(groupName, world) {
        let elapsedTime = world.getGameLoop().getElapsedTime();
        for(let entity of world.getEntityComponentManager().select(filter)) {
            let satiety = entity.get(Satiety);
            satiety.current = Math.max(0, satiety.current - elapsedTime / 1000 / satiety.declineRatePerSeconds);
        }
    }
};