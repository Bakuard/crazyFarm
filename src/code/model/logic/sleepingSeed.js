'use strict'

const {VegetableMeta} = require('./vegetableMeta');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {GrowTimer, growStates} = require('./growTimer.js');
const {GardenBedCell} = require('./gardenBedCell.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');

module.exports.SleepingSeedSystem = class SleepingSeedSystem {

    constructor(entityComponentManager) {
        this.cellFilter = entityComponentManager.createFilter().all(GardenBedCell);
        this.vegetableFilter = entityComponentManager.createFilter().allTags('sleeping seed');
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();
        let eventManager = world.getEventManager();

        if(eventManager.readEvent('seeds', 0)) {
            for(let entity of manager.select(this.cellFilter)) {
                let cell = entity.get(GardenBedCell);

                if(cell && !cell.vegetable) {
                    let vegetable = buffer.create();
                    vegetable.put(new VegetableMeta('Potato'), new GardenBedCellLink(entity)).
                        addTags('sleeping seed');
                    buffer.bind(vegetable);

                    cell.vegetable = vegetable;
                    buffer.bind(entity);
                }
            }
        }

        for(let entity of manager.select(this.vegetableFilter)) {
            if(eventManager.readEvent('bailer', 0)) {
                entity.removeTags('sleeping seed').
                    put(
                        GrowTimer.of(growStates.seed, [3, 15, 15, 15, 15]),
                        Immunity.of(10, 1, 0.2),
                        Satiety.of(10, 1),
                        Thirst.of(10, 1)
                    );
                buffer.bind(entity);
            }
        }

        manager.flush(buffer);
        eventManager.clearEventQueue('seeds');
    }

};