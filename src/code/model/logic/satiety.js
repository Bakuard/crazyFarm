'use strict'

const {Wallet} = require('./wallet.js');
const {VegetableState, lifeCycleStates} = require('./vegetableState.js');

class Satiety {
    static of(max, declineRatePerSeconds, alarmLevel) {
        return new Satiety(max, max, declineRatePerSeconds, alarmLevel);
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
module.exports.Satiety = Satiety;

module.exports.SatietySystem = class SatietySystem {
    constructor(entityComponentManager) {
        this.filter = entityComponentManager.createFilter().all(Satiety, VegetableState);
    }

    update(systemHandler, world) {
        const manager = world.getEntityComponentManager();
        const eventManager = world.getEventManager();
        const elapsedTime = world.getGameLoop().getElapsedTime();
        const grid = manager.getSingletonEntity('grid');
        const wallet = manager.getSingletonEntity('wallet').get(Wallet);
        
        for(let entity of manager.select(this.filter)) {
            const satiety = entity.get(Satiety);
            const isAlarm = satiety.isAlarm();

            satiety.current = Math.max(0, satiety.current - elapsedTime / 1000 / satiety.declineRatePerSeconds);

            if(satiety.current == 0) entity.get(VegetableState).pushState(lifeCycleStates.death);

            if(satiety.isAlarm() != isAlarm) eventManager.setFlag('gameStateWasChangedEvent');
        }

        eventManager.forEachEvent('fertilizer', (event, index) => {
            const vegetable = grid.get(event.cellX, event.cellY);
            if(this.#canFertilize(vegetable, wallet)) {
                const satiety = vegetable.get(Satiety);

                satiety.current = satiety.max;
                wallet.sum -= wallet.fertilizerPrice;

                eventManager.setFlag('gameStateWasChangedEvent');
            }
        });

        eventManager.clearEventQueue('fertilizer');
    }

    #canFertilize(vegetable, wallet) {
        return Boolean(
            vegetable
            && vegetable.hasComponents(Satiety, VegetableState)
            && vegetable.get(VegetableState).current() != lifeCycleStates.death
            && wallet.sum >= wallet.fertilizerPrice
        );
    }
};