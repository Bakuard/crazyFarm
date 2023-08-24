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

                    wallet.get(Wallet).sum += fabric.vegetablePrice(
                        vegetable.get(VegetableMeta).typeName, 
                        vegetable.get(GrowTimer).growState
                    ).price;
                }
            }
        }

        manager.flush(buffer);
        eventManager.clearEventQueue('shovel');
    }
};