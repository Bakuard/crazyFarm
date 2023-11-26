'use strict'

const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {VegetableState, lifeCycleStates} = require('./vegetableState.js');
const {VegetableMeta} = require('./vegetableMeta.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {OnionHealer} = require('./onionHeal.js');

module.exports.OnionDeathSystem = class OnionDeathSystem {
    constructor(entityComponentManager, randomGenerator) {
        this.randomGenerator = randomGenerator;
        this.explodedFilter = entityComponentManager.createFilter().
            allTags('exploded').
            all(VegetableState, VegetableMeta, GardenBedCellLink);
        this.explodingFilter = entityComponentManager.createFilter().
            allTags('exploding').
            all(VegetableState, VegetableMeta, GardenBedCellLink);
        this.deadFilter = entityComponentManager.createFilter().
            allTags('dead').
            all(VegetableState, VegetableMeta, GardenBedCellLink);
    }

    update(systemHandler, world) {
        const eventManager = world.getEventManager();
        const manager = world.getEntityComponentManager();
        const buffer = manager.createCommandBuffer();
        const grid = manager.getSingletonEntity('grid');

        this.#updateExplodedOnions(manager, buffer, grid, eventManager);
        this.#updateDeadOnions(manager, buffer, grid, eventManager);

        manager.flush(buffer);
    }

    #updateExplodedOnions(manager, buffer, grid, eventManager) {
        for(let vegetable of manager.select(this.explodingFilter)) {
            const meta = vegetable.get(VegetableMeta);
            if(meta.typeName == 'Onion') this.#removeOnion(vegetable, buffer, grid, eventManager);
        }

        for(let vegetable of manager.select(this.explodedFilter)) {
            const meta = vegetable.get(VegetableMeta);
            if(meta.typeName == 'Onion') this.#markVegetableAsExploding(vegetable, buffer);
        }
    }

    #updateDeadOnions(manager, buffer, grid, eventManager) {
        const {sleepingSeed, seed, sprout, child, youth, adult, death} = lifeCycleStates;

        for(let vegetable of manager.select(this.deadFilter)) {
            const meta = vegetable.get(VegetableMeta);
            const state = vegetable.get(VegetableState);

            if(meta.typeName == 'Onion') {
                if(state.currentIsOneOf(child, youth, adult)) {
                    this.#infectNeigboursAndDie(vegetable, buffer, grid, eventManager);
                } else if(state.currentIsOneOf(sleepingSeed, seed)) {
                    this.#removeOnion(vegetable, buffer, grid, eventManager);
                } else if(state.current() == sprout) {
                    this.#makeDeadOnionSprout(vegetable, buffer, eventManager);
                }
            }
        }
    }

    #removeOnion(vegetable, buffer, grid, eventManager) {
        const cell = vegetable.get(GardenBedCellLink);

        grid.remove(cell.cellX, cell.cellY);
        buffer.removeEntity(vegetable);
        eventManager.setFlag('gameStateWasChangedEvent');
    }

    #makeDeadOnionSprout(vegetable, buffer, eventManager) {
        const state = vegetable.get(VegetableState);

        vegetable.remove(Immunity, Satiety, Thirst);
        state.pushState(lifeCycleStates.death);
        buffer.bindEntity(vegetable);
        eventManager.setFlag('gameStateWasChangedEvent');
    }

    #markVegetableAsExploding(vegetable, buffer) {
        const state = vegetable.get(VegetableState);

        vegetable.addTags('exploding');
        vegetable.remove(OnionHealer);
        state.pushState(lifeCycleStates.death);
        buffer.bindEntity(vegetable);
    }

    #infectNeigboursAndDie(vegetable, buffer, grid, eventManager) {
        const onionHealer = vegetable.get(OnionHealer);
        const cellLink = vegetable.get(GardenBedCellLink);
        const state = vegetable.get(VegetableState);

        const cells = grid.getRandomNeigboursFor(cellLink.cellX, cellLink.cellY, onionHealer.cellNumberForDeath, this.randomGenerator);
        for(let cell of cells) {
            const immunity = this.#extractImmuntiyComp(cell.value);
            if(immunity && !immunity.isAlarm()) {
                immunity.isSick = true;
                immunity.current = immunity.alarmLevel;
            }
        }

        vegetable.remove(Immunity, Satiety, Thirst, OnionHealer);
        state.pushState(lifeCycleStates.death);
        buffer.bindEntity(vegetable);

        eventManager.setFlag('gameStateWasChangedEvent');
    }

    #extractImmuntiyComp(vegetable) {
        return vegetable && vegetable.hasComponents(Immunity) ? vegetable.get(Immunity) : null;
    }
};