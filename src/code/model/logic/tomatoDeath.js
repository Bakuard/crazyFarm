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
    constructor(entityComponentManager, randomGenerator) {
        this.randomGenerator = randomGenerator;
        this.explosionFilter = entityComponentManager.createFilter().all(TomatoExplosion);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();
        let grid = manager.getSingletonEntity('grid');
        let fabric = manager.getSingletonEntity('fabric');

        let isDeadTomato = this.#isDeadTomato;
        let canBeBlownUp = this.#canBeBlownUp;
        let randomGenerator = this.randomGenerator;
        grid.forEach((x, y, vegetable) => {
            if(isDeadTomato(vegetable)) {
                let state = vegetable.get(VegetableState);
                if(state.previousIsOneOf(lifeCycleStates.child, lifeCycleStates.youth, lifeCycleStates.adult)) {
                    let explosion = fabric.tomatoExplosion(state.previous());

                    let neighbours = grid.getRandomNeigboursFor(
                        x, 
                        y, 
                        explosion.neighboursNumber, 
                        randomGenerator
                    );
                    neighbours.filter(item => canBeBlownUp(item.value)).forEach(({value: neighbour}) => {
                        neighbour.get(VegetableState).history.push(lifeCycleStates.death);
                        neighbour.addTags('exploded');
                        buffer.bindEntity(neighbour);
                    });
                }
                
                grid.remove(x, y);

                buffer.removeEntity(vegetable);
            }
        });

        manager.flush(buffer);
    }

    #canBeBlownUp(vegetable) {
        return vegetable
            && vegetable.hasComponents(VegetableState)
            && !vegetable.get(VegetableState).currentIsOneOf(
                lifeCycleStates.death, 
                lifeCycleStates.seed, 
                lifeCycleStates.sleepingSeed
            );
    }

    #isDeadTomato(vegetable) {
        return vegetable
            && vegetable.hasComponents(VegetableMeta, VegetableState, Immunity, Satiety, Thirst)
            && vegetable.get(VegetableMeta).typeName == 'Tomato'
            && vegetable.get(VegetableState).current() == lifeCycleStates.death;
    }

};