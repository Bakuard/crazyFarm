'use strict'

const {EntityFilter} = require('../gameEngine/entityComponentManager.js');

class Thirst {
    constructor(max, declineRatePerSeconds) {
        this.max = max;
        this.current = max;
        this.declineRatePerSeconds = declineRatePerSeconds;
    }
};
module.exports.Thirst = Thirst;

let filter = new EntityFilter().all(Thirst);
module.exports.ThirstSystem = class ThirstSystem {
    update(groupName, world) {
        let elapsedTime = world.getGameLoop().getElapsedTime();
        for(let entity of world.getEntityComponentManager().select(filter)) {
            let thirst = entity.get(Thirst);
            thirst.current = Math.max(0, thirst.current - elapsedTime / 1000 / thirst.declineRatePerSeconds);
        }
    }
};