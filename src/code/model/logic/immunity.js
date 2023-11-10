'use strict'

const {Wallet} = require('./wallet.js');

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
        this.filter = entityComponentManager.createFilter().all(Immunity).noneTags('dead');
    }

    update(systemHandler, world) {
        const eventManager = world.getEventManager();
        const manager = world.getEntityComponentManager();
        const grid = manager.getSingletonEntity('grid');
        const wallet = manager.getSingletonEntity('wallet').get(Wallet);
        const elapsedTime = world.getGameLoop().getElapsedTime();
        const buffer = manager.createCommandBuffer();
        
        for(let vegetable of manager.select(this.filter)) {
            const immunity = vegetable.get(Immunity);
            const isAlarm = immunity.isAlarm();

            immunity.isSick ||= this.randomGenerator() <= immunity.probability;

            if(immunity.isSick) immunity.current = Math.max(0, immunity.current - elapsedTime / 1000 / immunity.declineRatePerSeconds);

            if(immunity.current == 0) {
                vegetable.addTags('dead');
                buffer.bindEntity(vegetable);
            }

            if(immunity.isAlarm() != isAlarm) eventManager.setFlag('gameStateWasChangedEvent');
        }

        eventManager.forEachEvent('sprayer', (event, index) => {
            const vegetable = grid.get(event.cellX, event.cellY);
            if(this.#canHeal(vegetable, wallet)) {
                const immunity = vegetable.get(Immunity);

                immunity.current = immunity.max;
                immunity.isSick = false;
                wallet.sum -= wallet.sprayerPrice;

                eventManager.setFlag('gameStateWasChangedEvent');
            }
        });

        manager.flush(buffer);
        eventManager.clearEventQueue('sprayer');
    }

    #canHeal(vegetable, wallet) {
        return Boolean(
            vegetable
            && vegetable.hasComponents(Immunity)
            && wallet.sum >= wallet.sprayerPrice
        );
    }
};
