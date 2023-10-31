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
        this.deadFilter = entityComponentManager.createFilter().all(VegetableState, VegetableMeta, GardenBedCellLink).none(PotatoGhost);
        this.ghostFilter = entityComponentManager.createFilter().all(PotatoGhost, GardenBedCellLink);
    }

    update(groupName, world) {
        const {sleepingSeed, seed, sprout, child, youth, adult, death} = lifeCycleStates;
        const manager = world.getEntityComponentManager();
        const buffer = manager.createCommandBuffer();
        const fabric = manager.getSingletonEntity('fabric');
        const grid = manager.getSingletonEntity('grid');

        for(let entity of manager.select(this.deadFilter)) {
            let meta = entity.get(VegetableMeta);
            let state = entity.get(VegetableState);
            let cell = entity.get(GardenBedCellLink);

            if(meta.typeName == 'Potato') {
                if(entity.hasTags('exploded')) {
                    if(state.currentIsOneOf(sleepingSeed, seed, sprout)) {
                        grid.remove(cell.cellX, cell.cellY);
                        buffer.removeEntity(entity);
                    } else if(state.currentIsOneOf(child, youth, adult)) {
                        entity.remove(Immunity, Satiety, Thirst);
                        entity.put(fabric.potatoGhost());
                        state.pushState(death);
                        buffer.bindEntity(entity);
                    } else if(state.current() == death && state.previousIsOneOf(sleepingSeed, seed, sprout)) {
                        grid.remove(cell.cellX, cell.cellY);
                        buffer.removeEntity(entity);
                    } else if(state.current() == death && state.previousIsOneOf(child, youth, adult)) {
                        entity.remove(Immunity, Satiety, Thirst);
                        entity.put(fabric.potatoGhost());
                        state.pushState(death);
                        buffer.bindEntity(entity);
                    }
                } else if(state.current() == death) {
                    if(state.previousIsOneOf(child, youth, adult)) {
                        entity.remove(Immunity, Satiety, Thirst);
                        entity.put(fabric.potatoGhost());
                        buffer.bindEntity(entity);
                    } else if(state.previousIsOneOf(sleepingSeed, seed)) {
                        grid.remove(cell.cellX, cell.cellY);
                        buffer.removeEntity(entity);
                    } else if(state.previous() == sprout) {
                        entity.remove(Immunity, Satiety, Thirst);
                        buffer.bindEntity(entity);
                    }
                }
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