'use strict'

module.exports.EventManager = class EventManager {
    #events;

    constructor() {
        this.#events = {};
    }

    writeEvent(name, ...events) {
        if(this.#events[name] == undefined) this.#events[name] = [];
        this.#events[name].push(...events);
    }

    readEvent(name, index) {
        let event = null;
        if(index >= 0 && index < this.eventsNumber(name)) {
            event = this.#events[name].at(index);
        }
        return event;
    }

    forEachEvent(name, callback) {
        for(let i = 0; i < this.eventsNumber(name); i++) {
            callback(this.#events[name][i], i);
        }
    }

    forEach(callback) {
        for(let [eventName, events] of Object.entries(this.#events)) {
            for(let event of events) {
                callback(eventName, event);
            }
        }
    }

    eventsNumber(eventName) {
        return this.#events[eventName]?.length ?? 0;
    }

    clearEventQueue(name) {
        if(this.#events[name] != undefined) this.#events[name].length = 0;
    }

    clearAll() {
        this.#events = {};
    }

};