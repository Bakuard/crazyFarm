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
    findByName(stateName) {
        return this.allValues.find(state => state.name == stateName)
    },
    slice(from, to) {
        return Object.values(this).filter(state => state.ordinal >= from.ordinal && state.ordinal <= to.ordinal);
    },
    findByOrdinal(stateOrdinal) {
        return this.allValues[stateOrdinal];
    } 
};
lifeCycleStates.allValues = Object.freeze(Object.values(lifeCycleStates));
lifeCycleStates = Object.freeze(lifeCycleStates);
module.exports.lifeCycleStates = lifeCycleStates;

class VegetableState {
    static of(seedDetail, sproutDetail, childDetail, youthDetail) {
        return new VegetableState([lifeCycleStates.sleepingSeed], [seedDetail, sproutDetail, childDetail, youthDetail]);
    }

    constructor(history, stateDetails) {
        this.history = history;
        this.stateDetails = stateDetails;
    }

    currentIsOneOf(...lifeCycleStates) {
        return lifeCycleStates.some(state => state === this.history.at(-1));
    }

    previousIsOneOf(...lifeCycleStates) {
        return lifeCycleStates.some(state => state === this.history.at(-2));
    }

    current() {
        return this.history.at(-1);
    }

    previous() {
        return this.history.at(-2);
    }

    stateDetail(lifeCycleState) {
        return this.stateDetails.find(stateDetail => stateDetail.lifeCycleState == lifeCycleState);
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

    intervalInMillis() {
        return this.intervalInSecond * 1000;
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
            let {seed, sprout, child, youth} = lifeCycleStates;

            if(vegetableState.currentIsOneOf(seed, sprout, child, youth)) {
                this.#nextState(vegetableState, elapsedTime);
            } else if(vegetableState.current() == lifeCycleStates.sleepingSeed && eventManager.readEvent('bailer', 0)) {
                let meta = entity.get(VegetableMeta);

                entity.put(
                    fabric.thirst(meta.typeName),
                    fabric.satiety(meta.typeName),
                    fabric.immunity(meta.typeName)
                );
                vegetableState.history.push(lifeCycleStates.seed);
                this.#nextState(vegetableState, elapsedTime);

                buffer.bindEntity(entity);
                eventManager.clearEventQueue('bailer');
            }
        }

        manager.flush(buffer);
    }

    #nextState(vegetableState, elapsedTime) {
        let {seed, sprout, child, youth} = lifeCycleStates;

        while(vegetableState.currentIsOneOf(seed, sprout, child, youth) && elapsedTime > 0) {
            let stateDetail = vegetableState.stateDetail(vegetableState.current());
            let diff = Math.min(stateDetail.intervalInMillis() - stateDetail.currentTimeInMillis, elapsedTime);
            elapsedTime -= diff;
            stateDetail.currentTimeInMillis += diff;
            if(stateDetail.currentTimeInMillis >= stateDetail.intervalInMillis()) {
                vegetableState.history.push(lifeCycleStates.findByOrdinal(vegetableState.current().ordinal + 1));
            }
        }
    }
};