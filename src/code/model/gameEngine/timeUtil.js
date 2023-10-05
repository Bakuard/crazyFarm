'use strict'

module.exports.TimeUtil = class TimeUtil {
    constructor() {}

    now() {
        return Date.now();
    }

    infiniteLoop(callback, iterationDurationInMillis) {
        return setInterval(callback, iterationDurationInMillis);
    }

    stopLoop(loopId) {
        clearInterval(loopId);
    }
};