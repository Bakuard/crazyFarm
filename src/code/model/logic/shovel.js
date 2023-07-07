'use strict'

const {VegetableMeta} = require('./vegetableMeta.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');

module.exports.ShovelSystem = class ShovelSystem {
    constructor(entityComponentManager) {
        this.filter = entityComponentManager.createFilter().all(VegetableMeta);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let eventManager = world.getEventManager();
        let buffer = manager.createBuffer();

        if(eventManager.readEvent('shovel', 0)) {
            for(let entity of manager.select(this.filter)) {
                entity.get(GardenBedCellLink).gardenBedCell.vegetable = null;
                buffer.remove(entity);
            }
        }

        manager.flush(buffer);
        eventManager.clearEventQueue('shovel');
    }
};