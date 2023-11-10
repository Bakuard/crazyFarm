'use strict'

const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {VegetableState, lifeCycleStates} = require('./vegetableState.js');
const {VegetableMeta} = require('./vegetableMeta.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');

class TomatoExplosion {
    constructor(neighboursNumber, timeInMillis) {
        this.neighboursNumber = neighboursNumber;
        this.timeInMillis = timeInMillis;
    }
};
module.exports.TomatoExplosion = TomatoExplosion;

module.exports.TomatoDeathSystem = class TomatoDeathSystem {
    constructor(entityComponentManager, randomGenerator) {
        this.randomGenerator = randomGenerator;
        this.recentlyDeadTomatoes = entityComponentManager.createFilter().
            all(VegetableMeta, VegetableState, GardenBedCellLink).
            none(TomatoExplosion).
            allTags('dead');
        this.explodedTomatos = entityComponentManager.createFilter().all(TomatoExplosion, GardenBedCellLink);
    }

    update(systemHandler, world) {
        const eventManager = world.getEventManager();
        const manager = world.getEntityComponentManager();
        const buffer = manager.createCommandBuffer();
        const grid = manager.getSingletonEntity('grid');
        const fabric = manager.getSingletonEntity('fabric');
        const elapsedTime = world.getGameLoop().getElapsedTime();

        const stack = this.#updateRecentlyDeadTomatoes(manager, grid, buffer, eventManager);
        this.#updateExplosionChainReaction(stack, elapsedTime, grid, buffer, eventManager, fabric);
        this.#updateExplodedTomatos(manager, elapsedTime, grid, buffer, eventManager);

        manager.flush(buffer);
    }


    #updateRecentlyDeadTomatoes(manager, grid, buffer, eventManager) {
        const {sleepingSeed, seed, sprout, child, youth, adult, death} = lifeCycleStates;

        const stack = [];
        for(let vegetable of manager.select(this.recentlyDeadTomatoes)) {
            const meta = vegetable.get(VegetableMeta);
            const state = vegetable.get(VegetableState);
            
            if(meta.typeName == 'Tomato') {
                if(state.currentIsOneOf(child, youth, adult)) stack.push(vegetable);
                else if(state.current() == sprout) this.#makeDeadTomatoSprout(vegetable, buffer, eventManager);
                else if(state.currentIsOneOf(sleepingSeed, seed)) this.#removeTomato(vegetable, grid, buffer, eventManager);
            }
        }

        return stack;
    }

    #updateExplosionChainReaction(stack, elapsedTime, grid, buffer, eventManager, fabric) {
        const {sleepingSeed, seed, sprout, child, youth, adult, death} = lifeCycleStates;

        const visited = [];
        while(stack.length > 0) {
            const vegetable = stack.pop();
            visited.push(vegetable);
            const meta = vegetable.get(VegetableMeta);
            const state = vegetable.get(VegetableState);

            if(meta.typeName == 'Tomato') {
                if(state.currentIsOneOf(sleepingSeed, seed, sprout) || (state.current() == death && state.previous() == sprout)) {
                    this.#removeTomato(vegetable, grid, buffer, eventManager);
                } else if(state.currentIsOneOf(child, youth, adult)) {
                    this.#explodeTomato(vegetable, fabric, grid, buffer, eventManager, visited, stack, elapsedTime);
                }
            } else {
                vegetable.addTags('exploded');
                buffer.bindEntity(vegetable);
            }
        }
    }

    #updateExplodedTomatos(manager, elapsedTime, grid, buffer, eventManager) {
        for(let tomato of manager.select(this.explodedTomatos)) {
            const explosion = tomato.get(TomatoExplosion);
            explosion.timeInMillis -= elapsedTime;
            if(explosion.timeInMillis <= 0) this.#removeTomato(tomato, grid, buffer, eventManager);
        }
    }

    #makeDeadTomatoSprout(vegetable, buffer, eventManager) {
        const state = vegetable.get(VegetableState);

        vegetable.remove(Immunity, Satiety, Thirst);
        state.pushState(lifeCycleStates.death);
        buffer.bindEntity(vegetable);
        eventManager.setFlag('gameStateWasChangedEvent');
    }

    #removeTomato(vegetable, grid, buffer, eventManager) {
        const cell = vegetable.get(GardenBedCellLink);

        grid.remove(cell.cellX, cell.cellY);
        buffer.removeEntity(vegetable);
        eventManager.setFlag('gameStateWasChangedEvent');
    }

    #explodeTomato(vegetable, fabric, grid, buffer, eventManager, visited, stack, elapsedTime) {
        const state = vegetable.get(VegetableState);
        const cell = vegetable.get(GardenBedCellLink);
        const explosion = fabric.tomatoExplosion(state.current());
        const neighbours = grid.getRandomNeigboursFor(cell.cellX, cell.cellY, explosion.neighboursNumber, this.randomGenerator);
        neighbours.
            filter(({value: neighbour}) => neighbour && neighbour.hasComponents(VegetableMeta) && !visited.some(v => v.equals(neighbour))).
            forEach(({value: neighbour}) => stack.push(neighbour));

        explosion.timeInMillis -= elapsedTime;
        if(explosion.timeInMillis > 0) {
            state.pushState(lifeCycleStates.death);
            vegetable.remove(Immunity, Satiety, Thirst);
            vegetable.put(explosion)
            buffer.bindEntity(vegetable);
        } else {
            this.#removeTomato(vegetable, grid, buffer, eventManager);
        }
        eventManager.setFlag('gameStateWasChangedEvent');
    }

};