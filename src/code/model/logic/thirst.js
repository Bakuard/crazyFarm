'use strict'

const {fixedIntervalAdapter} = require('../gameEngine/gameLoop.js');

module.exports.Thirst = class Thirst {
    constructor(max, start, declineRatePerSeconds) {
        this.max = max;
        this.current = start;
        this.declineRatePerSeconds = declineRatePerSeconds;
    }
};

module.exports.thisrtSystem = fixedIntervalAdapter((groupName, world) => {
    
}, 1000);