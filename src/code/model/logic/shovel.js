'use strict'

const {VegetableMeta} = require('./vegetableMeta.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {GardenBedCell} = require('./gardenBedCell.js');
const {Wallet} = require('./wallet.js');
const {VegetableState, lifeCycleStates} = require('./vegetableState.js');

module.exports.ShovelSystem = class ShovelSystem {
    constructor(entityComponentManager) {
        this.filter = entityComponentManager.createFilter().all(VegetableState, GardenBedCellLink, VegetableMeta);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let eventManager = world.getEventManager();
        let buffer = manager.createCommandBuffer();
        let fabric = manager.getSingletonEntity('fabric');
        let wallet = manager.getSingletonEntity('wallet');

        if(eventManager.readEvent('shovel', 0)) {
            for(let vegetable of manager.select(this.filter)) {
                if(vegetable.get(VegetableState).history.at(-1) != lifeCycleStates.death) {
                    let cell = vegetable.get(GardenBedCellLink).gardenBedCell;
                    
                    cell.get(GardenBedCell).entity = null;
                    buffer.removeEntity(vegetable);

                    wallet.get(Wallet).sum += this.#calculatePrice(
                        fabric.vegetablePrizeFactor(vegetable.get(VegetableMeta).typeName),
                        vegetable.get(VegetableState).history.at(-1)
                    );
                }
            }
        }

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
};