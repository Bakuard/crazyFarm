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
        this.aliveVegetables = entityComponentManager.createFilter().
            all(VegetableMeta, VegetableState, GardenBedCellLink, Immunity, Satiety, Thirst).
            noneTags('exploded');
        this.explodedTomatos = entityComponentManager.createFilter().all(TomatoExplosion, GardenBedCellLink);
    }

    update(groupName, world) {
        const {sleepingSeed, seed, sprout, child, youth, adult, death} = lifeCycleStates;
        const manager = world.getEntityComponentManager();
        const buffer = manager.createCommandBuffer();
        const grid = manager.getSingletonEntity('grid');
        const fabric = manager.getSingletonEntity('fabric');

        const stack = [];
        for(let vegetable of manager.select(this.aliveVegetables)) {
            let meta = vegetable.get(VegetableMeta);
            let state = vegetable.get(VegetableState);
            
            if(meta.typeName == 'Tomato' && state.current() == death) {
                if(state.previousIsOneOf(child, youth, adult)) {
                    vegetable.addTags('exploded');
                    stack.push(vegetable);
                } else if(state.previous() == sprout) {
                    vegetable.remove(Immunity, Satiety, Thirst);
                    buffer.bindEntity(vegetable);
                }
            }
        }

        let elapsedTime = world.getGameLoop().getElapsedTime();
        while(stack.length > 0) {
            let vegetable = stack.pop();
            let state = vegetable.get(VegetableState);
            let cell = vegetable.get(GardenBedCellLink);

            if(state.currentIsOneOf(sleepingSeed, seed, sprout) || (state.current() == death && state.previous() == sprout)) {
                vegetable.remove(Immunity, Satiety, Thirst);
                grid.remove(cell.cellX, cell.cellY);
                buffer.removeEntity(vegetable);
            } else if(state.current() == death && state.previousIsOneOf(child, youth, adult) || state.currentIsOneOf(child, youth, adult)) {
                let explosion = fabric.tomatoExplosion(state.current());
                explosion.timeInMillis -= elapsedTime;
                let neighbours = grid.getRandomNeigboursFor(cell.cellX, cell.cellY, explosion.neighboursNumber, this.randomGenerator);
                neighbours.
                    filter(({value: neighbour}) => neighbour && neighbour.hasComponents(VegetableMeta) && !neighbour.hasTags('exploded')).
                    forEach(({value: neighbour}) => {
                        let meta = vegetable.get(VegetableMeta);
                        neighbour.addTags('exploded');
                        if(meta.typeName != 'Tomato') buffer.bindEntity(neighbour);
                        else stack.push(neighbour);
                    });
                vegetable.remove(Immunity, Satiety, Thirst);
                vegetable.put(explosion);
                if(explosion.timeInMillis > 0) {
                    buffer.bindEntity(vegetable);
                } else {
                    grid.remove(cell.cellX, cell.cellY);
                    buffer.removeEntity(vegetable);
                }

                if(state.currentIsOneOf(child, youth, adult))  state.pushState(death);
            }
        }

        for(let tomato of manager.select(this.explodedTomatos)) {
            let cell = tomato.get(GardenBedCellLink);
            let explosion = tomato.get(TomatoExplosion);

            explosion.timeInMillis -= elapsedTime;
            if(explosion.timeInMillis <= 0) {
                grid.remove(cell.cellX, cell.cellY);
                buffer.removeEntity(tomato);
            }
        }

        manager.flush(buffer);
    }

};