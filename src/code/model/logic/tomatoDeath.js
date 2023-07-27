'use strict'

const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {GardenBedCell} = require('./gardenBedCell.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {GrowTimer} = require('./growTimer.js');

module.exports.TomatoDeathSystem = class TomatoDeathSystem {
    constructor(entityComponentManager) {
        this.deadFilter = entityComponentManager.createFilter().allTags('Tomato', 'dead');
        this.explosionFilter = entityComponentManager.createFilter().allTags('explosion');
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();

        for(let entity of manager.select(this.deadFilter)) {
            entity.remove(GrowTimer, Immunity, Satiety, Thirst).
                removeTags('Tomato', 'dead').
                addTags('explosion');
            buffer.bindEntity(entity);
        }

        for(let entity of manager.select(this.explosionFilter)) {
            let cell = entity.get(GardenBedCellLink).gardenBedCell;
            cell.get(GardenBedCell).entity = null;
            buffer.removeEntity(entity);
        }

        manager.flush(buffer);
    }

};