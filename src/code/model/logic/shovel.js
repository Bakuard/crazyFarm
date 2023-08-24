'use strict'

const {VegetableMeta} = require('./vegetableMeta.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {GardenBedCell} = require('./gardenBedCell.js');
const {Wallet} = require('./wallet.js');
const {GrowTimer} = require('./growTimer.js');

module.exports.ShovelSystem = class ShovelSystem {
    constructor(entityComponentManager) {
        this.filter = entityComponentManager.createFilter().all(VegetableMeta);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let eventManager = world.getEventManager();
        let buffer = manager.createCommandBuffer();
        let fabric = manager.getSingletonEntity('fabric');
        let wallet = manager.getSingletonEntity('wallet');

        if(eventManager.readEvent('shovel', 0)) {
            for(let vegetable of manager.select(this.filter)) {
                if(vegetable.hasComponents(VegetableMeta, GrowTimer)) {
                    let cell = vegetable.get(GardenBedCellLink).gardenBedCell;
                    
                    cell.get(GardenBedCell).entity = null;
                    buffer.removeEntity(vegetable);

                    wallet.get(Wallet).sum += this.#calculatePrice(
                        fabric.vegetablePrizeFactor(vegetable.get(VegetableMeta).typeName),
                        vegetable.get(GrowTimer).growState
                    );
                }
            }
        }

        manager.flush(buffer);
        eventManager.clearEventQueue('shovel');
    }

    #calculatePrice(vegetablePrizeFactor, growState) {
        let totalSecondInterval = 0;
        for(let i = 0; i <= growState.ordinal; i++) {
            totalSecondInterval += vegetablePrizeFactor.intervalsInSeconds[i];
        }

        let price = (totalSecondInterval / vegetablePrizeFactor.satietyAlertLevel * vegetablePrizeFactor.fertilizerPrice +
                     totalSecondInterval / vegetablePrizeFactor.immunityAlertLevel * vegetablePrizeFactor.sprayerPrice +
                     vegetablePrizeFactor.seedsPrice) * vegetablePrizeFactor.priceCoff;
        
        return Math.ceil(price); 
    }
};