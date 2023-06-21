'use strict'

const {EntityFilter} = require('../gameEngine/entityComponentManager.js');
const {FixedInterval} = require('../gameEngine/gameLoop.js');

class Immunity {
    constructor(max, declineRatePerSeconds, probability) {
        this.max = max;
        this.current = max;
        this.isSick = false;
        this.declineRatePerSeconds = declineRatePerSeconds;
        this.probability = probability;
    }
};
module.exports.Immunity = Immunity;

let filter = new EntityFilter().all(Immunity);
module.exports.ImmunitySystem = class ImmunitySystem {
    constructor(randomGenerator) {
        this.randomGenerator = randomGenerator;
        this.fixedInterval = new FixedInterval(1000);
    }

    update(groupName, world) {
        let elapsedTime = world.getGameLoop().getElapsedTime();
        for(let entity of world.getEntityComponentManager().select(filter)) {
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
        }
    }
};