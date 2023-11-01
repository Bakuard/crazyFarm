'use strict'

const {Wallet} = require('./wallet.js');
const {VegetableState, lifeCycleStates} = require('./vegetableState.js');

class Immunity {
    static of(max, declineRatePerSeconds, probability, alarmLevel) {
        return new Immunity(max, max, false, declineRatePerSeconds, probability, alarmLevel);
    }

    constructor(max, current, isSick, declineRatePerSeconds, probability, alarmLevel) {
        this.max = max;
        this.current = current;
        this.isSick = isSick;
        this.declineRatePerSeconds = declineRatePerSeconds;
        this.probability = probability;
        this.alarmLevel = alarmLevel;
    }

    isAlarm() {
        return this.current < this.alarmLevel;
    }
};
module.exports.Immunity = Immunity;

module.exports.ImmunitySystem = class ImmunitySystem {
    constructor(entityComponentManager, randomGenerator) {
        this.randomGenerator = randomGenerator;
        this.filter = entityComponentManager.createFilter().all(Immunity, VegetableState);
    }

    update(groupName, world) {
        const eventManager = world.getEventManager();
        const manager = world.getEntityComponentManager();
        const grid = manager.getSingletonEntity('grid');
        const wallet = manager.getSingletonEntity('wallet').get(Wallet);
        const elapsedTime = world.getGameLoop().getElapsedTime();
        
        for(let vegetable of manager.select(this.filter)) {
            let immunity = vegetable.get(Immunity);

            immunity.isSick ||= this.randomGenerator() <= immunity.probability;

            if(immunity.isSick) immunity.current = Math.max(0, immunity.current - elapsedTime / 1000 / immunity.declineRatePerSeconds);

            if(immunity.current == 0) vegetable.get(VegetableState).pushState(lifeCycleStates.death);
        }

        eventManager.forEachEvent('sprayer', (event, index) => {
            let vegetable = grid.get(event.cellX, event.cellY);
            if(this.#canHeal(vegetable, wallet)) {
                let immunity = vegetable.get(Immunity);

                immunity.current = immunity.max;
                immunity.isSick = false;
                wallet.sum -= wallet.sprayerPrice;
            }
        });

        eventManager.clearEventQueue('sprayer');
    }

    #canHeal(vegetable, wallet) {
        return Boolean(
            vegetable
            && vegetable.hasComponents(Immunity, VegetableState)
            && vegetable.get(VegetableState).current() != lifeCycleStates.death
            && wallet.sum >= wallet.sprayerPrice
        );
    }
};
