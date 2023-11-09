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

    update(systemHandler, world) {
        const manager = world.getEntityComponentManager();
        const eventManager = world.getEventManager();
        const elapsedTime = world.getGameLoop().getElapsedTime();
        const grid = manager.getSingletonEntity('grid');

        for(let entity of manager.select(this.filter)) {
            const thirst = entity.get(Thirst);
            const isAlarm = thirst.isAlarm();

            thirst.current = Math.max(0, thirst.current - elapsedTime / 1000 / thirst.declineRatePerSeconds);

            if(thirst.current == 0) entity.get(VegetableState).pushState(lifeCycleStates.death);

            if(thirst.isAlarm() != isAlarm) eventManager.setFlag('gameStateWasChangedEvent');
        }

        eventManager.forEachEvent('bailer', (event, index) => {
            const vegetable = grid.get(event.cellX, event.cellY);
            if(this.#canPour(vegetable)) {
                const thirst = vegetable.get(Thirst);
                thirst.current = thirst.max;
                eventManager.setFlag('gameStateWasChangedEvent');
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