'use strict'

const {FixedInterval} = require('../gameEngine/gameLoop.js');

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
        let eventManager = world.getEventManager();
        let elapsedTime = world.getGameLoop().getElapsedTime();
        
        for(let entity of world.getEntityComponentManager().select(this.filter)) {
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

            if(eventManager.readEvent('sprayer', 0)) {
                immunity.current = immunity.max;
                immunity.isSick = false;
            }
        }

        eventManager.clearEventQueue('sprayer');
    }
};