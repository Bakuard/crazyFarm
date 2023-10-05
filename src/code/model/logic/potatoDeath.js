'use strict'

const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {VegetableState, lifeCycleStates} = require('./vegetableState.js');
const {VegetableMeta} = require('./vegetableMeta.js');

class PotatoGhost {
    constructor(timeInMillis) {
        this.timeInMillis = timeInMillis;
    }
};
module.exports.PotatoGhost = PotatoGhost;

module.exports.PotatoDeathSystem = class PotatoDeathSystem {
    constructor(entityComponentManager) {
        this.deadFilter = entityComponentManager.createFilter().all(VegetableState, VegetableMeta, Immunity, Satiety, Thirst);
        this.ghostFilter = entityComponentManager.createFilter().all(PotatoGhost);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();
        let fabric = manager.getSingletonEntity('fabric');
        let grid = manager.getSingletonEntity('grid');

        for(let entity of manager.select(this.deadFilter)) {
            let meta = entity.get(VegetableMeta);
            let state = entity.get(VegetableState);
            if(meta.typeName == 'Potato' && state.current() == lifeCycleStates.death) {
                entity.remove(Immunity, Satiety, Thirst);
                if(state.previousIsOneOf(lifeCycleStates.child, lifeCycleStates.youth, lifeCycleStates.adult)) {
                    entity.put(fabric.potatoGhost());
                }
                buffer.bindEntity(entity);
            }
        }

        let elapsedTime = world.getGameLoop().getElapsedTime();
        for(let entity of manager.select(this.ghostFilter)) {
            let potatoGhost = entity.get(PotatoGhost);

            potatoGhost.timeInMillis = Math.max(0, potatoGhost.timeInMillis - elapsedTime);
            if(potatoGhost.timeInMillis == 0) {
                let cellLink = entity.get(GardenBedCellLink);
                grid.remove(cellLink.cellX, cellLink.cellY);
                buffer.removeEntity(entity);
            }
        }

        manager.flush(buffer);
    }
};