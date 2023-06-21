'use strict'

const {EntityFilter} = require('../gameEngine/entityComponentManager.js');

class Immunity {
    constructor(max, declineRatePerSeconds) {
        this.max = max;
        this.current = max;
        this.isSick = false;
        this.declineRatePerSeconds = declineRatePerSeconds;
    }
};
module.exports.Immunity = Immunity;

let filter = new EntityFilter().all(Immunity);
module.exports.ImmunitySystem = class ImmunitySystem {
    constructor(randomGenerator) {
        this.randomGenerator = randomGenerator;
    }
    update(groupName, world) {
        let elapsedTime = world.getGameLoop().getElapsedTime();
        for(let entity of world.getEntityComponentManager().select(filter)) {
            let immunity = entity.get(Disease);
            immunity.current = Math.max(0, immunity.current - elapsedTime / 1000 / immunity.declineRatePerSeconds);
        }
    }
};