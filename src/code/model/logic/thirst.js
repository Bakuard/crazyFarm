'use strict'

const {VegetableState, lifeCycleStates} = require('./vegetableState.js');

class Thirst {
    static of(max, declineRatePerSeconds, alarmLevel) {
        return new Thirst(max, max, declineRatePerSeconds, alarmLevel);
    }

    constructor(max, current, declineRatePerSeconds, alarmLevel) {
        this.max = max;
        this.current = current;
        this.declineRatePerSeconds = declineRatePerSeconds;
        this.alarmLevel = alarmLevel;
    }

    isAlarm() {
        return this.current <= this.alarmLevel;
    }
};
module.exports.Thirst = Thirst;

module.exports.ThirstSystem = class ThirstSystem {
    constructor(entityComponentManager) {
        this.filter = entityComponentManager.createFilter().all(Thirst, VegetableState);
    }

    update(systemName, groupName, world) {
        let manager = world.getEntityComponentManager();
        let eventManager = world.getEventManager();
        let elapsedTime = world.getGameLoop().getElapsedTime();
        let grid = manager.getSingletonEntity('grid');

        for(let entity of manager.select(this.filter)) {
            let thirst = entity.get(Thirst);
            thirst.current = Math.max(0, thirst.current - elapsedTime / 1000 / thirst.declineRatePerSeconds);
            if(thirst.current == 0) {
                entity.get(VegetableState).pushState(lifeCycleStates.death);
            }
        }

        eventManager.forEachEvent('bailer', (event, index) => {
            let vegetable = grid.get(event.cellX, event.cellY);
            if(this.#canPour(vegetable)) {
                let thirst = vegetable.get(Thirst);
                thirst.current = thirst.max;
            }
        });

        eventManager.clearEventQueue('bailer');
    }

    #canPour(vegetable) {
        return Boolean(
            vegetable
            && vegetable.hasComponents(Thirst, VegetableState)
            && vegetable.get(VegetableState).current() != lifeCycleStates.death
        );
    }
};