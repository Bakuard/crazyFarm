'use strict'

const {Wallet} = require('./wallet.js');
const {VegetableState, lifeCycleStates} = require('./vegetableState.js');

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
    constructor(entityComponentManager) {
        this.filter = entityComponentManager.createFilter().all(Satiety, VegetableState);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let eventManager = world.getEventManager();
        let elapsedTime = world.getGameLoop().getElapsedTime();
        let grid = manager.getSingletonEntity('grid');
        let wallet = manager.getSingletonEntity('wallet').get(Wallet);
        
        for(let entity of manager.select(this.filter)) {
            let satiety = entity.get(Satiety);
            satiety.current = Math.max(0, satiety.current - elapsedTime / 1000 / satiety.declineRatePerSeconds);
            if(satiety.current == 0) {
                entity.get(VegetableState).pushState(lifeCycleStates.death);
            }
        }

        eventManager.forEachEvent('fertilizer', (event, index) => {
            let vegetable = grid.get(event.cellX, event.cellY);
            if(this.#canFertilize(vegetable, wallet)) {
                let satiety = vegetable.get(Satiety);

                satiety.current = satiety.max;
                wallet.sum -= wallet.fertilizerPrice;
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