'use strict'

const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {GardenBedCell} = require('./gardenBedCell.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {VegetableState} = require('./vegetableState.js');
const {VegetableMeta} = require('./vegetableMeta.js');

module.exports.TomatoDeathSystem = class TomatoDeathSystem {
    constructor(entityComponentManager) {
        this.deadFilter = entityComponentManager.createFilter().all(VegetableMeta, VegetableState);
        this.explosionFilter = entityComponentManager.createFilter().allTags('explosion');
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();

        for(let entity of manager.select(this.deadFilter)) {
            let meta = entity.get(VegetableMeta);
            let state = entity.get(VegetableState);
            if(meta.typeName == 'Tomato' && state.history.at(-1) == lifeCycleStates.death) {
                entity.remove(Immunity, Satiety, Thirst).addTags('explosion');
                buffer.bindEntity(entity);
            }
        }

        for(let entity of manager.select(this.explosionFilter)) {
            let cell = entity.get(GardenBedCellLink).gardenBedCell;
            cell.get(GardenBedCell).entity = null;
            buffer.removeEntity(entity);
        }

        manager.flush(buffer);
    }

};