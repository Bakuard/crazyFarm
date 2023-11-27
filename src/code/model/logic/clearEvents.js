'use strict'

module.exports.ClearEventsSystem = class ClearEventsSystem {

    constructor() {

    }

    update(systemHandler, world) {
        const eventManager = world.getEventManager();
        eventManager.clearAll();
    }

};