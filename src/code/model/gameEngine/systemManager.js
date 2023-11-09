'use strict'

const exceptions = require('../exception/exceptions.js');

const DEFAULT_GROUP = 'DEFAULT_GROUP';
module.exports.DEFAULT_GROUP = DEFAULT_GROUP;

class SystemHandler {
    constructor(systemName, groupName, system, index, groupSize) {
        this.systemName = systemName;
        this.groupName = groupName;
        this.system = system;
        this.index = index;
        this.groupSize = groupSize;
    }

    clone() {
        return new SystemHandler(
            this.systemName,
            this.groupName,
            this.system,
            this.index,
            this.groupSize
        );
    }
}
module.exports.SystemHandler = SystemHandler;

module.exports.SystemManager = class SystemManager {

    #world;
    #groups;

    constructor(world) {
        this.#groups = {};
        this.#groups[DEFAULT_GROUP] = [];
        this.#world = world;
    }

    putSystem(systemName, system) {
        const systemHandler = this.#getSystemHandler(systemName);
        if(!systemHandler) {
            const group = this.#groups[DEFAULT_GROUP];
            group.push(new SystemHandler(systemName, DEFAULT_GROUP, system, group.length, group.length + 1));
            this.#updateIndexesOfGroup(DEFAULT_GROUP);
        } else {
            for(let group of Object.values(this.#groups)) {
                group.forEach(sh => {
                    if(sh.systemName == systemName) sh.system = system;
                });
            }
        }

        return this;
    }

    appendToGroup(systemName, groupName) {
        const system = this.#tryGetSystem(systemName);
        const group = this.#groups[groupName] ?? (this.#groups[groupName] = []);
        group.push(new SystemHandler(systemName, groupName, system, group.length, group.length + 1));
        this.#updateIndexesOfGroup(groupName);

        return this;
    }

    insertSystem(systemName, groupName, index) {
        const system = this.#tryGetSystem(systemName);
        const group = this.#groups[groupName] ?? (this.#groups[groupName] = []);
        this.#assertIndexInBound(index, group.length);
        group.splice(index, 0, new SystemHandler(systemName, groupName, system, index, group.length + 1));
        this.#updateIndexesOfGroup(groupName);

        return this;
    }

    removeSystem(systemName) {
        for(let groupName of Object.keys(this.#groups)) {
            this.#groups[groupName] = this.#groups[groupName].filter(systemHandler => systemHandler.systemName != systemName);
            this.#updateIndexesOfGroup(groupName);
        }
        return this;
    }

    updateGroup(groupName) {
        const group = this.#groups[groupName];
        if(group) {
            const groupCopy = group.map(systemHandler => systemHandler.clone());
            groupCopy.forEach(systemHandler => systemHandler.system.update(systemHandler, this.#world));
        }
    }


    #tryGetSystem(systemName) {
        const system = this.#getSystemHandler(systemName)?.system;
        if(!system) {
            throw new exceptions.UnknownSystemException(`There is not system with name '${systemName}'.`);
        }
        return system;
    }

    #getSystemHandler(systemName) {
        return this.#groups[DEFAULT_GROUP].find(systemHandler => systemHandler.systemName == systemName);
    }

    #updateIndexesOfGroup(groupName) {
        const group = this.#groups[groupName];
        for(let i = 0; i < group.length; i++) {
            const systemHandler = group[i];
            systemHandler.index = i;
            systemHandler.groupSize = group.length;
        }
    }

    #assertIndexInBound(index, groupSize) {
        if(index < 0 || index >= groupSize) {
            throw new exceptions.IndexOutOfBoundException(`groupSize=${groupSize}, index=${index}`);
        }
    }

}