'use strict'

module.exports.Satiety = class Satiety {
    constructor(max, start, declineRatePerSeconds) {
        this.max = max;
        this.current = start;
        this.declineRatePerSeconds = declineRatePerSeconds;
    }
};

module.exports.satietySystem = function satietySystem(groupName, world) {
    
};