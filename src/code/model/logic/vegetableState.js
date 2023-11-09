'use strict'

const {VegetableMeta} = require('./vegetableMeta');

function LifeCycleState(ordinal, name) {
    return Object.freeze({
        ordinal,
        name
    });
}
let lifeCycleStates = {
    sleepingSeed: new LifeCycleState(0, 'sleepingSeed'),
    seed: new LifeCycleState(1, 'seed'),
    sprout: new LifeCycleState(2, 'sprout'),
    child: new LifeCycleState(3, 'child'),
    youth: new LifeCycleState(4, 'youth'),
    adult: new LifeCycleState(5, 'adult'),
    death: new LifeCycleState(6, 'death'),
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

    pushState(lifeCycleState) {
        if(this.history.length > 0 && this.current() != lifeCycleState) this.history.push(lifeCycleState);
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

    update(systemHandler, world) {
        const eventManager = world.getEventManager();
        const manager = world.getEntityComponentManager();
        const buffer = manager.createCommandBuffer();
        const fabric = manager.getSingletonEntity('fabric');
        const grid = manager.getSingletonEntity('grid');

        const elapsedTime = world.getGameLoop().getElapsedTime();
        for(let entity of world.getEntityComponentManager().select(this.filter)) {
            const vegetableState = entity.get(VegetableState);
            const {seed, sprout, child, youth} = lifeCycleStates;

            if(vegetableState.currentIsOneOf(seed, sprout, child, youth)) {
                this.#nextState(vegetableState, elapsedTime, eventManager);
            }
        }

        for(let i = 0; i < eventManager.eventsNumber('bailer'); i++) {
            const event = eventManager.readEvent('bailer', i);
            const vegetable = grid.get(event.cellX, event.cellY);

            if(this.#isSleepingSeed(vegetable)) {
                const meta = vegetable.get(VegetableMeta);
                const vegetableState = vegetable.get(VegetableState);

                vegetable.put(
                    fabric.thirst(meta.typeName),
                    fabric.satiety(meta.typeName),
                    fabric.immunity(meta.typeName)
                );
                vegetableState.pushState(lifeCycleStates.seed);
                this.#nextState(vegetableState, elapsedTime, eventManager);
                buffer.bindEntity(vegetable);

                eventManager.markEvent('bailer', i, 'emptyBailer');
                eventManager.setFlag('gameStateWasChangedEvent');
            }
        }

        eventManager.clearEventQueue('bailer', 'emptyBailer');
        manager.flush(buffer);
    }

    #nextState(vegetableState, elapsedTime, eventManager) {
        const {seed, sprout, child, youth} = lifeCycleStates;

        while(vegetableState.currentIsOneOf(seed, sprout, child, youth) && elapsedTime > 0) {
            let stateDetail = vegetableState.stateDetail(vegetableState.current());
            let diff = Math.min(stateDetail.intervalInMillis() - stateDetail.currentTimeInMillis, elapsedTime);
            elapsedTime -= diff;
            stateDetail.currentTimeInMillis += diff;
            if(stateDetail.currentTimeInMillis >= stateDetail.intervalInMillis()) {
                vegetableState.history.push(lifeCycleStates.findByOrdinal(vegetableState.current().ordinal + 1));

                eventManager.setFlag('gameStateWasChangedEvent');
            }
        }
    }

    #isSleepingSeed(vegetable) {
        return vegetable
            && vegetable.hasComponents(VegetableState, VegetableMeta)
            && vegetable.get(VegetableState).current() == lifeCycleStates.sleepingSeed;
    }
};