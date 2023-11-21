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
    constructor(entityComponentManager, potatoGhostFabric) {
        this.potatoGhostFabric = potatoGhostFabric;
        this.explodedFilter = entityComponentManager.createFilter().
            allTags('exploded').
            all(VegetableState, VegetableMeta, GardenBedCellLink).
            none(PotatoGhost);
        this.deadFilter = entityComponentManager.createFilter().
            allTags('dead').
            all(VegetableState, VegetableMeta, GardenBedCellLink).
            none(PotatoGhost);
        this.ghostFilter = entityComponentManager.createFilter().
            all(PotatoGhost, GardenBedCellLink);
    }

    update(systemHandler, world) {
        const eventManager = world.getEventManager();
        const manager = world.getEntityComponentManager();
        const buffer = manager.createCommandBuffer();
        const grid = manager.getSingletonEntity('grid');

        this.#updateExplodedPotatos(manager, grid, buffer, eventManager);
        this.#updateDeadPotatos(manager, grid, buffer, eventManager);
        this.#updatePotatoGhosts(manager, grid, buffer, eventManager, world.getGameLoop().getElapsedTime());

        manager.flush(buffer);
    }

    #updateExplodedPotatos(manager, grid, buffer, eventManager) {
        const {sleepingSeed, seed, sprout, child, youth, adult, death} = lifeCycleStates;

        for(let vegetable of manager.select(this.explodedFilter)) {
            const meta = vegetable.get(VegetableMeta);
            const state = vegetable.get(VegetableState);

            if(meta.typeName == 'Potato') {
                if(state.currentIsOneOf(sleepingSeed, seed, sprout) || 
                   state.current() == death && state.previousIsOneOf(sleepingSeed, seed, sprout)) {
                    this.#removePotato(vegetable, grid, buffer, eventManager);
                } else if(state.currentIsOneOf(child, youth, adult)) {
                    this.#makePotatoesGhost(vegetable, buffer, eventManager);
                }
            }
        }
    }

    #updateDeadPotatos(manager, grid, buffer, eventManager) {
        const {sleepingSeed, seed, sprout, child, youth, adult, death} = lifeCycleStates;

        for(let vegetable of manager.select(this.deadFilter)) {
            const meta = vegetable.get(VegetableMeta);
            const state = vegetable.get(VegetableState);

            if(meta.typeName == 'Potato') {
                if(state.currentIsOneOf(child, youth, adult)) {
                    this.#makePotatoesGhost(vegetable, buffer, eventManager);
                } else if(state.currentIsOneOf(sleepingSeed, seed)) {
                    this.#removePotato(vegetable, grid, buffer, eventManager);
                } else if(state.current() == sprout) {
                    this.#makeDeadPotatoSprout(vegetable, buffer, eventManager);
                }            
            }
        }
    }

    #updatePotatoGhosts(manager, grid, buffer, eventManager, elapsedTime) {
        for(let vegetable of manager.select(this.ghostFilter)) {
            const potatoGhost = vegetable.get(PotatoGhost);
            potatoGhost.timeInMillis = Math.max(0, potatoGhost.timeInMillis - elapsedTime);
            if(potatoGhost.timeInMillis == 0) this.#removePotato(vegetable, grid, buffer, eventManager);
        }
    }

    #removePotato(vegetable, grid, buffer, eventManager) {
        const cell = vegetable.get(GardenBedCellLink);

        grid.remove(cell.cellX, cell.cellY);
        buffer.removeEntity(vegetable);
        eventManager.setFlag('gameStateWasChangedEvent');
    }

    #makePotatoesGhost(vegetable, buffer, eventManager) {
        const state = vegetable.get(VegetableState);

        vegetable.remove(Immunity, Satiety, Thirst);
        vegetable.put(this.potatoGhostFabric());
        state.pushState(lifeCycleStates.death);
        buffer.bindEntity(vegetable);
        eventManager.setFlag('gameStateWasChangedEvent');
    }

    #makeDeadPotatoSprout(vegetable, buffer, eventManager) {
        const state = vegetable.get(VegetableState);

        vegetable.remove(Immunity, Satiety, Thirst);
        state.pushState(lifeCycleStates.death);
        buffer.bindEntity(vegetable);
        eventManager.setFlag('gameStateWasChangedEvent');
    }

};