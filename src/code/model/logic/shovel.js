'use strict'

const {VegetableMeta} = require('./vegetableMeta.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {GardenBedCell} = require('./gardenBedCell.js');
const {PotatoGhost} = require('./potatoDeath.js');

module.exports.ShovelSystem = class ShovelSystem {
    constructor(entityComponentManager) {
        this.filter = entityComponentManager.createFilter().all(VegetableMeta);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let eventManager = world.getEventManager();
        let buffer = manager.createCommandBuffer();

        if(eventManager.readEvent('shovel', 0)) {
            for(let entity of manager.select(this.filter)) {
                if(!entity.hasComponents(PotatoGhost)) {
                    let cell = entity.get(GardenBedCellLink).gardenBedCell;
                    cell.get(GardenBedCell).entity = null;
                    buffer.removeEntity(entity);
                }
            }
        }

        manager.flush(buffer);
        eventManager.clearEventQueue('shovel');
    }
};