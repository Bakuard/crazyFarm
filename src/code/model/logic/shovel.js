'use strict'

const {VegetableMeta} = require('./vegetableMeta.js');
const {Wallet} = require('./wallet.js');
const {VegetableState, lifeCycleStates} = require('./vegetableState.js');

module.exports.ShovelSystem = class ShovelSystem {
    constructor(vegetablePrizeFactorFabric) {
        this.vegetablePrizeFactorFabric = vegetablePrizeFactorFabric;
    }

    update(systemHandler, world) {
        const manager = world.getEntityComponentManager();
        const eventManager = world.getEventManager();
        const buffer = manager.createCommandBuffer();
        const wallet = manager.getSingletonEntity('wallet');
        const grid = manager.getSingletonEntity('grid');

        const canBeDugUp = this.#canBeDugUp;
        eventManager.forEachEvent('shovel', (event, index) => {
            const vegetable = grid.get(event.cellX, event.cellY);
            if(canBeDugUp(vegetable)) {
                grid.remove(event.cellX, event.cellY);
                buffer.removeEntity(vegetable);

                wallet.get(Wallet).sum += this.#calculatePrice(
                    this.vegetablePrizeFactorFabric(vegetable.get(VegetableMeta).typeName),
                    vegetable.get(VegetableState).current()
                );

                eventManager.setFlag('gameStateWasChangedEvent');
            }
        });

        manager.flush(buffer);
        eventManager.clearEventQueue('shovel');
    }

    #calculatePrice(vegetablePrizeFactor, lifeCycleState) {
        console.log(`prizeFactor: ${JSON.stringify(vegetablePrizeFactor, null, 4)}`);
        let price = 0;

        if(lifeCycleState.ordinal >= lifeCycleStates.child.ordinal && lifeCycleState.ordinal <= lifeCycleStates.adult.ordinal) {
            let totalSecondInterval = 0;
            for(let i = 0; i < lifeCycleState.ordinal - 1; i++) {
                totalSecondInterval += vegetablePrizeFactor.growIntervals[i];
            }

            price = (totalSecondInterval / vegetablePrizeFactor.satietyAlarmLevel * vegetablePrizeFactor.fertilizerPrice +
                        totalSecondInterval / vegetablePrizeFactor.immunityAlarmtLevel * vegetablePrizeFactor.sprayerPrice +
                        vegetablePrizeFactor.seedsPrice) * vegetablePrizeFactor.priceCoff;
        }
        
        return Math.ceil(price); 
    }

    #canBeDugUp(vegetable) {
        return vegetable 
            && vegetable.hasComponents(VegetableState, VegetableMeta)
            && !vegetable.hasTags('impossibleToDigUp');
    }
};