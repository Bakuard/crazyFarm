'use strict'

const {VegetableMeta} = require('./vegetableMeta');

let lifeCycleStates = {
    sleepingSeed: Object.freeze({ordinal: 0, name: 'sleepingSeed'}),
    seed: Object.freeze({ordinal: 1, name: 'seed'}),
    sprout: Object.freeze({ordinal: 2, name: 'sprout'}),
    child: Object.freeze({ordinal: 3, name: 'child'}),
    youth: Object.freeze({ordinal: 4, name: 'youth'}),
    adult: Object.freeze({ordinal: 5, name: 'adult'}),
    death: Object.freeze({ordinal: 6, name: 'death'}),
    findByName: function(stateName) {
        return this.allValues.find(state => state.name == stateName)
    }
};
lifeCycleStates.allValues = Object.freeze(Object.values(lifeCycleStates));
lifeCycleStates = Object.freeze(lifeCycleStates);
module.exports.lifeCycleStates = lifeCycleStates;

class VegetableState {
    static of(seedDetail, sproutDetail, chidlDetail, youthDetail) {
        return new VegetableState([lifeCycleStates.sleepingSeed], seedDetail, sproutDetail, chidlDetail, youthDetail);
    }

    constructor(history, seedDetail, sproutDetail, chidlDetail, youthDetail) {
        this.history = history;
        this.stateDetails = [seedDetail, sproutDetail, chidlDetail, youthDetail];
    }
};
module.exports.VegetableState = VegetableState;

class StateDetail {
    static of(intervalInSecond, lifeCyleState) {
        return new StateDetail(0, intervalInSecond, lifeCyleState);
    }

    constructor(currentTimeInMillis, intervalInSecond, lifeCyleState) {
        this.currentTimeInMillis = currentTimeInMillis;
        this.intervalInSecond = intervalInSecond;
        this.lifeCycleState = lifeCyleState;
    }
};
module.exports.StateDetail = StateDetail;

module.exports.GrowSystem = class GrowSystem {
    constructor(entityComponentManager) {
        this.filter = entityComponentManager.createFilter().all(VegetableState);
    }

    update(groupName, world) {
        let eventManager = world.getEventManager();
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();
        let fabric = manager.getSingletonEntity('fabric');

        let elapsedTime = world.getGameLoop().getElapsedTime();
        for(let entity of world.getEntityComponentManager().select(this.filter)) {
            let vegetableState = entity.get(VegetableState);
            let currentStateOrdinal = vegetableState.history.at(-1).ordinal;

            if(currentStateOrdinal >= lifeCycleStates.seed.ordinal && currentStateOrdinal < lifeCycleStates.adult.ordinal) {
                let stateDetail = this.#getStateDetail(vegetableState, currentStateOrdinal);
                stateDetail.currentTimeInMillis += elapsedTime;
                if(stateDetail.currentTimeInMillis >= stateDetail.intervalInSecond * 1000) {
                    let nextState = lifeCycleStates.allValues[currentStateOrdinal + 1];
                    vegetableState.history.push(nextState);
                }
            } else if(currentStateOrdinal == lifeCycleStates.sleepingSeed.ordinal && eventManager.readEvent('bailer', 0)) {
                let meta = entity.get(VegetableMeta);
                entity.put(
                    fabric.thirst(meta.typeName),
                    fabric.satiety(meta.typeName),
                    fabric.immunity(meta.typeName)
                );
                entity.get(VegetableState).history.push(lifeCycleStates.seed);
                buffer.bindEntity(entity);
                eventManager.clearEventQueue('bailer');
            }
        }

        manager.flush(buffer);
    }

    #getStateDetail(vegetableStateComp, currentStateOrdinal) {
        return vegetableStateComp.stateDetails.find(stateDetail => stateDetail.lifeCycleState.ordinal == currentStateOrdinal);
    }
};