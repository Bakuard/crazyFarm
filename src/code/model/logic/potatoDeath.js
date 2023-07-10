'use strict'

const {FixedInterval} = require('../gameEngine/gameLoop.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {GardenBedCell} = require('./gardenBedCell.js');

class PotatoGhost {
    constructor(timeInMillis) {
        this.timeInMillis = timeInMillis;
    }
};
module.exports.PotatoGhost = PotatoGhost;

module.exports.PotatoDeathSystem = class PotatoDeathSystem {
    deadFilter;
    constructor(entityComponentManager) {
        this.fixedInterval = new FixedInterval(1000);
        this.deadFilter = entityComponentManager.createFilter().all(PotatoGhost);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();

        let elapsedTime = world.getGameLoop().getElapsedTime();
        for(let entity of manager.select(this.deadFilter)) {
            let potatoGhost = entity.get(PotatoGhost);

            potatoGhost.timeInMillis = Math.max(0, potatoGhost.timeInMillis - elapsedTime);
            if(potatoGhost.timeInMillis == 0) {
                let cell = entity.get(GardenBedCellLink).gardenBedCell;
                cell.get(GardenBedCell).vegetable = null;
                buffer.remove(entity);
            }
        }

        manager.flush(buffer);
    }
};