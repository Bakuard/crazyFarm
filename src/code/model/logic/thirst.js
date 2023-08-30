'use strict'

const {VegetableState, lifeCycleStates} = require('./vegetableState.js');

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
        this.filter = entityComponentManager.createFilter().all(Thirst, VegetableState);
    }

    update(groupName, world) {
        let eventManager = world.getEventManager();
        let elapsedTime = world.getGameLoop().getElapsedTime();

        for(let entity of world.getEntityComponentManager().select(this.filter)) {
            let thirst = entity.get(Thirst);
            thirst.current = Math.max(0, thirst.current - elapsedTime / 1000 / thirst.declineRatePerSeconds);

            if(eventManager.readEvent('bailer', 0)) {
                thirst.current = thirst.max;
            }

            if(thirst.current == 0) {
                entity.get(VegetableState).history.push(lifeCycleStates.death);
            }
        }

        eventManager.clearEventQueue('bailer');
    }
};