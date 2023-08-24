'use strict'

const {Wallet} = require('./wallet.js');

class Satiety {
    static of(max, declineRatePerSeconds) {
        return new Satiety(max, max, declineRatePerSeconds);
    }

    constructor(max, current, declineRatePerSeconds) {
        this.max = max;
        this.current = current;
        this.declineRatePerSeconds = declineRatePerSeconds;
    }
};
module.exports.Satiety = Satiety;

module.exports.SatietySystem = class SatietySystem {
    filter;
    constructor(entityComponentManager) {
        this.filter = entityComponentManager.createFilter().all(Satiety);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let eventManager = world.getEventManager();
        let elapsedTime = world.getGameLoop().getElapsedTime();
        
        for(let entity of manager.select(this.filter)) {
            let satiety = entity.get(Satiety);
            satiety.current = Math.max(0, satiety.current - elapsedTime / 1000 / satiety.declineRatePerSeconds);

            let wallet = manager.getSingletonEntity('wallet').get(Wallet);
            if(eventManager.readEvent('fertilizer', 0) && wallet.sum >= wallet.fertilizerPrice) {
                satiety.current = satiety.max;
                wallet.sum -= wallet.fertilizerPrice;
            }
        }

        eventManager.clearEventQueue('fertilizer');
    }
};