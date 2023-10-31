'use strict'

const {FixedInterval} = require('../gameEngine/gameLoop.js');
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
        this.fixedInterval = new FixedInterval(1000);
        this.filter = entityComponentManager.createFilter().all(Immunity, VegetableState);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let eventManager = world.getEventManager();
        let elapsedTime = world.getGameLoop().getElapsedTime();
        let random = this.randomGenerator();
        let grid = manager.getSingletonEntity('grid');
        let wallet = manager.getSingletonEntity('wallet').get(Wallet);
        
        for(let vegetable of manager.select(this.filter)) {
            let immunity = vegetable.get(Immunity);

            this.fixedInterval.execute(() => immunity.isSick ||= (random <= immunity.probability), elapsedTime);

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