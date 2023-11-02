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

    update(systemName, groupName, world) {
        const {sleepingSeed, seed, sprout, child, youth, adult, death} = lifeCycleStates;
        const eventManager = world.getEventManager();
        const manager = world.getEntityComponentManager();
        const buffer = manager.createCommandBuffer();
        const fabric = manager.getSingletonEntity('fabric');
        const grid = manager.getSingletonEntity('grid');

        for(let entity of manager.select(this.deadFilter)) {
            const meta = entity.get(VegetableMeta);
            const state = entity.get(VegetableState);
            const cell = entity.get(GardenBedCellLink);

            if(meta.typeName == 'Potato') {
                if(entity.hasTags('exploded')) {
                    if(state.currentIsOneOf(sleepingSeed, seed, sprout)) {
                        grid.remove(cell.cellX, cell.cellY);
                        buffer.removeEntity(entity);
                        eventManager.setFlag('gameStateWasChangedEvent');
                    } else if(state.currentIsOneOf(child, youth, adult)) {
                        entity.remove(Immunity, Satiety, Thirst);
                        entity.put(fabric.potatoGhost());
                        state.pushState(death);
                        buffer.bindEntity(entity);
                        eventManager.setFlag('gameStateWasChangedEvent');
                    } else if(state.current() == death && state.previousIsOneOf(sleepingSeed, seed, sprout)) {
                        grid.remove(cell.cellX, cell.cellY);
                        buffer.removeEntity(entity);
                        eventManager.setFlag('gameStateWasChangedEvent');
                    } else if(state.current() == death && state.previousIsOneOf(child, youth, adult)) {
                        entity.remove(Immunity, Satiety, Thirst);
                        entity.put(fabric.potatoGhost());
                        state.pushState(death);
                        buffer.bindEntity(entity);
                        eventManager.setFlag('gameStateWasChangedEvent');
                    }
                } else if(state.current() == death) {
                    if(state.previousIsOneOf(child, youth, adult)) {
                        entity.remove(Immunity, Satiety, Thirst);
                        entity.put(fabric.potatoGhost());
                        buffer.bindEntity(entity);
                        eventManager.setFlag('gameStateWasChangedEvent');
                    } else if(state.previousIsOneOf(sleepingSeed, seed)) {
                        grid.remove(cell.cellX, cell.cellY);
                        buffer.removeEntity(entity);
                        eventManager.setFlag('gameStateWasChangedEvent');
                    } else if(state.previous() == sprout) {
                        entity.remove(Immunity, Satiety, Thirst);
                        buffer.bindEntity(entity);
                        eventManager.setFlag('gameStateWasChangedEvent');
                    }
                }
            }
        }

        const elapsedTime = world.getGameLoop().getElapsedTime();
        for(const entity of manager.select(this.ghostFilter)) {
            const potatoGhost = entity.get(PotatoGhost);

            potatoGhost.timeInMillis = Math.max(0, potatoGhost.timeInMillis - elapsedTime);
            if(potatoGhost.timeInMillis == 0) {
                const cellLink = entity.get(GardenBedCellLink);
                grid.remove(cellLink.cellX, cellLink.cellY);
                buffer.removeEntity(entity);
                eventManager.setFlag('gameStateWasChangedEvent');
            }
        }

        manager.flush(buffer);
    }
};