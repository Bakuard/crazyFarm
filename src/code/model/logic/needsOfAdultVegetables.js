'use strict'

const {Immunity} = require("./immunity");
const {Satiety} = require("./satiety");
const {Thirst} = require("./thirst");
const {VegetableState, lifeCycleStates} = require("./vegetableState");

module.exports.NeedsOfAdultVegetables = class NeedsOfAdultVegetables {
    constructor(entityComponentManager) {
        this.filter = entityComponentManager.createFilter().
            all(VegetableState, Immunity, Satiety, Thirst);
    }

    update(systemHandler, world) {
        const manager = world.getEntityComponentManager();
        const buffer = manager.createCommandBuffer();

        for(let vegetable of manager.select(this.filter)) {
            const state = vegetable.get(VegetableState);

            if(state.current() == lifeCycleStates.adult) {
                vegetable.remove(Immunity, Satiety, Thirst);
                buffer.bindEntity(vegetable);
            }
        }

        manager.flush(buffer);
    }
}
