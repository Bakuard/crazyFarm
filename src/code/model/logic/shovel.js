'use strict'

const {VegetableMeta} = require('./vegetableMeta.js');
const {Wallet} = require('./wallet.js');
const {VegetableState, lifeCycleStates} = require('./vegetableState.js');

module.exports.ShovelSystem = class ShovelSystem {
    constructor() {
        
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let eventManager = world.getEventManager();
        let buffer = manager.createCommandBuffer();
        let fabric = manager.getSingletonEntity('fabric');
        let wallet = manager.getSingletonEntity('wallet');
        let grid = manager.getSingletonEntity('grid');

        let canBeDugUp = this.#canBeDugUp;
        eventManager.forEachEvent('shovel', (event, index) => {
            let vegetable = grid.get(event.cellX, event.cellY);
            if(canBeDugUp(vegetable)) {
                grid.remove(event.cellX, event.cellY);
                buffer.removeEntity(vegetable);

                wallet.get(Wallet).sum += this.#calculatePrice(
                    fabric.vegetablePrizeFactor(vegetable.get(VegetableMeta).typeName),
                    vegetable.get(VegetableState).current()
                );
            }
        });

        manager.flush(buffer);
        eventManager.clearEventQueue('shovel');
    }

    #calculatePrice(vegetablePrizeFactor, lifeCycleState) {
        let price = 0;

        if(lifeCycleState.ordinal >= lifeCycleStates.child.ordinal && lifeCycleState.ordinal <= lifeCycleStates.adult.ordinal) {
            let totalSecondInterval = 0;
            for(let i = 0; i < lifeCycleState.ordinal - 1; i++) {
                totalSecondInterval += vegetablePrizeFactor.growIntervals[i];
            }

            price = (totalSecondInterval / vegetablePrizeFactor.satietyAlertLevel * vegetablePrizeFactor.fertilizerPrice +
                        totalSecondInterval / vegetablePrizeFactor.immunityAlertLevel * vegetablePrizeFactor.sprayerPrice +
                        vegetablePrizeFactor.seedsPrice) * vegetablePrizeFactor.priceCoff;
        }
        
        return Math.ceil(price); 
    }

    #canBeDugUp(vegetable) {
        return vegetable 
            && (vegetable.get(VegetableState).current() != lifeCycleStates.death
                || vegetable.get(VegetableState).previous() == lifeCycleStates.sprout);
    }
};