'use strict'

const {FixedInterval} = require('../gameEngine/gameLoop.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {GardenBedCell} = require('./gardenBedCell.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {GrowTimer} = require('./growTimer.js');

class PotatoGhost {
    constructor(timeInMillis) {
        this.timeInMillis = timeInMillis;
    }
};
module.exports.PotatoGhost = PotatoGhost;

module.exports.PotatoDeathSystem = class PotatoDeathSystem {
    constructor(entityComponentManager) {
        this.fixedInterval = new FixedInterval(1000);
        this.deadFilter = entityComponentManager.createFilter().allTags('Potato', 'dead');
        this.ghostFilter = entityComponentManager.createFilter().all(PotatoGhost);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();

        for(let entity of manager.select(this.deadFilter)) {
            entity.remove(GrowTimer, Immunity, Satiety, Thirst).
                removeTags('Potato', 'dead').
                put(new PotatoGhost(10000));
            buffer.bindEntity(entity);
        }

        let elapsedTime = world.getGameLoop().getElapsedTime();
        for(let entity of manager.select(this.ghostFilter)) {
            let potatoGhost = entity.get(PotatoGhost);

            potatoGhost.timeInMillis = Math.max(0, potatoGhost.timeInMillis - elapsedTime);
            if(potatoGhost.timeInMillis == 0) {
                let cell = entity.get(GardenBedCellLink).gardenBedCell;
                cell.get(GardenBedCell).vegetable = null;
                buffer.removeEntity(entity);
            }
        }

        manager.flush(buffer);
    }
};