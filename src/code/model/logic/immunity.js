'use strict'

const {FixedInterval} = require('../gameEngine/gameLoop.js');
const {Wallet} = require('./wallet.js');

class Immunity {
    static of(max, declineRatePerSeconds, probability) {
        return new Immunity(max, max, false, declineRatePerSeconds, probability);
    }

    constructor(max, current, isSick, declineRatePerSeconds, probability) {
        this.max = max;
        this.current = current;
        this.isSick = isSick;
        this.declineRatePerSeconds = declineRatePerSeconds;
        this.probability = probability;
    }
};
module.exports.Immunity = Immunity;

module.exports.ImmunitySystem = class ImmunitySystem {
    filter;
    constructor(randomGenerator, entityComponentManager) {
        this.randomGenerator = randomGenerator;
        this.fixedInterval = new FixedInterval(1000);
        this.filter = entityComponentManager.createFilter().all(Immunity);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let eventManager = world.getEventManager();
        let elapsedTime = world.getGameLoop().getElapsedTime();
        
        for(let entity of manager.select(this.filter)) {
            let immunity = entity.get(Immunity);

            this.fixedInterval.execute(() => {
                if(!immunity.isSick) {
                    let random = this.randomGenerator();
                    immunity.isSick = random <= immunity.probability;
                }
            }, elapsedTime);

            if(immunity.isSick) {
                immunity.current = Math.max(0, 
                    immunity.current - elapsedTime / 1000 / immunity.declineRatePerSeconds);
            }

            let wallet = manager.getSingletonEntity('wallet').get(Wallet);
            if(eventManager.readEvent('sprayer', 0) && wallet.sum >= wallet.sprayerPrice) {
                immunity.current = immunity.max;
                immunity.isSick = false;
                wallet.sum -= wallet.sprayerPrice;
            }
        }

        eventManager.clearEventQueue('sprayer');
    }
};