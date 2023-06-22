'use strict'

const {EntityFilter} = require('../gameEngine/entityComponentManager.js');

let growStates = {
    seed: Object.freeze({ordinal: 0, name: 'seed'}),
    sprout: Object.freeze({ordinal: 1, name: 'sprout'}),
    child: Object.freeze({ordinal: 2, name: 'child'}),
    youth: Object.freeze({ordinal: 3, name: 'youth'}),
    adult: Object.freeze({ordinal: 4, name: 'adult'})
};
growStates.allValues = Object.freeze([growStates.seed, 
    growStates.sprout, 
    growStates.child, 
    growStates.youth, 
    growStates.adult]);
growStates = Object.freeze(growStates);
module.exports.growStates = growStates;

class GrowTimer {
    constructor(growState, intervalsInSeconds) {
        this.growState = growState;
        this.intervalsInSeconds = intervalsInSeconds;
        this.currentTimeInMillis = calculateTimeByGrowState(growState, intervalsInSeconds);
    }
};
module.exports.GrowTimer = GrowTimer;

let filter = new EntityFilter().all(GrowTimer);
module.exports.GrowTimerSystem = class GrowTimerSystem {
    update(groupName, world) {
        let elapsedTime = world.getGameLoop().getElapsedTime();
        for(let entity of world.getEntityComponentManager().select(filter)) {
            let growTimer = entity.get(GrowTimer);

            if(growTimer.growState != growStates.adult) {
                growTimer.currentTimeInMillis += elapsedTime;
                growTimer.growState = 
                    calculateGrowStateByTime(growTimer.currentTimeInMillis, growTimer.intervalsInSeconds);
            }
        }
    }
};

function calculateGrowStateByTime(timeInMillis, intervalsInSeconds) {
    let seconds = timeInMillis / 1000;
    let growState = growStates.allValues[0];
    let intervalSum = 0;
    for(let i = 0; i < growStates.allValues.length && intervalSum <= seconds; i++) {
        intervalSum += intervalsInSeconds[i];
        growState = growStates.allValues[i];
    }
    return growState;
}

function calculateTimeByGrowState(growState, intervalsInSeconds) {
    let intervalSum = 0;
    for(let i = 0; i < growState.ordinal; i++) intervalSum += intervalsInSeconds[i];
    return intervalSum * 1000;
}