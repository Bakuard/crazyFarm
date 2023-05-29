'use strict'

module.exports.SystemManager = class SystemManager {

    #systems;
    #groups;
    #events;

    constructor() {
        this.#systems = {};
        this.#groups = {};
        this.#events = {};
    }

    addSystem(name, updateMethod, ...groups) {
        this.#systems[name] = updateMethod;
        for(let groupName of groups) {
            if(!this.#groups[groupName]) this.#groups[groupName] = [];
            this.#groups[groupName].push(name);
        }
    }

    updateGroup(groupName, entityComponentManager, elapsedTime) {
        this.#groups[groupName].
            forEach(systemName => this.#systems[systemName](entityComponentManager, this, groupName, elapsedTime));
    }

    writeEvent(name, event) {
        this.#events[name] = event;
    }

    readEvent(name) {
        return this.#events[name];
    }

    removeEvent(name) {
        delete this.#events[name];
    }

}