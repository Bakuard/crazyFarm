'use strict'

module.exports.SystemManager = class SystemManager {

    #systems;
    #groups;
    #world;

    constructor(world) {
        this.#systems = {};
        this.#groups = {};
        this.#world = world;
    }

    putSystem(name, updateMethod, ...groupNames) {
        this.#systems[name] = updateMethod;
        for(let groupName of groupNames) {
            if(!this.#groups[groupName]) this.#groups[groupName] = [];
            this.#groups[groupName].push(name);
        }
        return this;
    }

    removeSystem(name) {
        delete this.#systems[name];
        for(let groupName of Object.keys(this.#groups)) {
            this.#groups[groupName] = this.#groups[groupName].filter(systemName => systemName != name);
        }
        return this;
    }

    updateGroup(groupName) {
        this.#groups[groupName]?.
            forEach(systemName => this.#systems[systemName](groupName, this.#world));
    }

}