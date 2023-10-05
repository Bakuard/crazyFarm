'use strict'

const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {VegetableState, lifeCycleStates} = require('./vegetableState.js');
const {VegetableMeta} = require('./vegetableMeta.js');

class TomatoExplosion {
    constructor(neighboursNumber) {
        this.neighboursNumber = neighboursNumber;
    }
};
module.exports.TomatoExplosion = TomatoExplosion;

module.exports.TomatoDeathSystem = class TomatoDeathSystem {
    constructor(entityComponentManager) {
        this.deadFilter = entityComponentManager.createFilter().all(VegetableMeta, VegetableState, Immunity, Satiety, Thirst);
        this.explosionFilter = entityComponentManager.createFilter().all(TomatoExplosion);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();
        let grid = manager.getSingletonEntity('grid');
        let fabric = manager.getSingletonEntity('fabric');

        for(let entity of manager.select(this.deadFilter)) {
            let meta = entity.get(VegetableMeta);
            let state = entity.get(VegetableState);
            if(meta.typeName == 'Tomato' && state.current() == lifeCycleStates.death) {
                entity.remove(Immunity, Satiety, Thirst);
                if(state.previousIsOneOf(lifeCycleStates.child, lifeCycleStates.youth, lifeCycleStates.adult)) {
                    entity.put(fabric.tomatoExplosion(state.history.at(-2)));
                }
                buffer.bindEntity(entity);
            }
        }

        for(let entity of manager.select(this.explosionFilter)) {
            let cellLink = entity.get(GardenBedCellLink);
            let explosion = entity.get(TomatoExplosion);
            let neighbours = grid.getNeigboursFor(cellLink.cellX, cellLink.cellY);
            neighbours = this.#chooseRandomItems(neighbours, explosion.neighboursNumber);
            neighbours.filter(vegetable => !vegetable.get(VegetableState).currentIsOneOf(lifeCycleStates.death, 
                                                                                        lifeCycleStates.seed, 
                                                                                        lifeCycleStates.sleepingSeed)
                ).forEach(vegetable => {
                    vegetable.get(VegetableState).history.push(lifeCycleStates.death);
                    vegetable.addTags('exploded');
                    buffer.bindEntity(vegetable);
                });
            grid.remove(cellLink.cellX, cellLink.cellY);
            buffer.removeEntity(entity);
        }

        manager.flush(buffer);
    }

    #chooseRandomItems(arr, itemsNumber) {
        for(let i = arr.length - 1; i >= arr.length - itemsNumber; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            const randomItem = arr[randomIndex];
            arr[randomIndex] = arr[i];
            arr[i] = randomItem;
        }
        return arr.slice(arr.length - itemsNumber, arr.length);
    }

};