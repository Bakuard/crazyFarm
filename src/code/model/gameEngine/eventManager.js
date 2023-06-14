'use strict'

module.exports.EventManager = class EventManager {
    #evetns;

    constructor() {
        this.#evetns = {};
    }

    writeEvent(name, event) {
        this.#events[name] = event;
    }

    readEvent(name) {
        return this.#events[name];
    }

    readAndRemoveEvent(name) {
        let event = this.#events[name];
        delete this.#events[name];
        return event;
    }
};