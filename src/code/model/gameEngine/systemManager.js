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

    addSystem(name, updateMethod, ...groups) {
        this.#systems[name] = updateMethod;
        for(let groupName of groups) {
            if(!this.#groups[groupName]) this.#groups[groupName] = [];
            this.#groups[groupName].push(name);
        }
    }

    updateGroup(groupName) {
        this.#groups[groupName].
            forEach(systemName => this.#systems[systemName](groupName, this.#world));
    }

}