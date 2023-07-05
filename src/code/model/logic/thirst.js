'use strict'

const {EntityFilter} = require('../gameEngine/entityComponentManager.js');

class Thirst {
    static of(max, declineRatePerSeconds) {
        return new Thirst(max, max, declineRatePerSeconds);
    }

    constructor(max, current, declineRatePerSeconds) {
        this.max = max;
        this.current = current;
        this.declineRatePerSeconds = declineRatePerSeconds;
    }
};
module.exports.Thirst = Thirst;

module.exports.ThirstSystem = class ThirstSystem {
    filter;
    constructor(entityComponentManager) {
        this.filter = entityComponentManager.createFilter().all(Thirst);
    }

    update(groupName, world) {
        let elapsedTime = world.getGameLoop().getElapsedTime();
        for(let entity of world.getEntityComponentManager().select(this.filter)) {
            let thirst = entity.get(Thirst);
            thirst.current = Math.max(0, thirst.current - elapsedTime / 1000 / thirst.declineRatePerSeconds);
        }
    }
};