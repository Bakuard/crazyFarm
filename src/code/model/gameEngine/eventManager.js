'use strict'

module.exports.EventManager = class EventManager {
    #events;

    constructor() {
        this.#events = {};
    }

    writeEvent(name, event) {
        if(this.#events[name] == undefined) this.#events[name] = [];
        this.#events[name].push(event);
    }

    readEvent(name, index) {
        let event = null;
        if(index >= 0 && index < this.#events[name]?.length) {
            event = this.#events[name].at(index);
        }
        return event;
    }

    clearEventQueue(name) {
        if(this.#events[name] != undefined) this.#events[name].length = 0;
    }

};