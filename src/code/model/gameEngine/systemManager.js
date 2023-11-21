'use strict'

const exceptions = require('../exception/exceptions.js');

class RegisteredSystem {
    constructor(systemName, system) {
        this.systemName = systemName;
        this.system = system;
    }
}

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
    #registeredSystems;

    constructor(world) {
        this.#groups = {};
        this.#registeredSystems = [];
        this.#world = world;
    }

    putSystem(systemName, system) {
        const registeredSystem = this.#getRegisteredSystem(systemName);
        if(!registeredSystem) {
            this.#registeredSystems.push(new RegisteredSystem(systemName, system));
        } else {
            registeredSystem.system = system;
            for(let group of Object.values(this.#groups)) {
                group.forEach(sh => {
                    if(sh.systemName == systemName) sh.system = system;
                });
            }
        }

        return this;
    }

    appendToGroup(groupName, systemName) {
        const system = this.#tryGetSystem(systemName);
        const group = this.#getOrCreateGroup(groupName);
        group.push(new SystemHandler(systemName, groupName, system, group.length, group.length + 1));
        this.#updateIndexAndSizeForEachHandler(groupName);

        return this;
    }

    insertIntoGroup(groupName, systemName, index) {
        const system = this.#tryGetSystem(systemName);
        const group = this.#getOrCreateGroup(groupName);
        this.#assertIndexInBound(index, group.length);
        group.splice(index, 0, new SystemHandler(systemName, groupName, system, index, group.length + 1));
        this.#updateIndexAndSizeForEachHandler(groupName);

        return this;
    }

    resetGroup(groupName, ...systemsName) {
        const group = [];
        for(let i = 0; i < systemsName.length; ++i) {
            const system = this.#tryGetSystem(systemsName[i]);
            const systemHandler = new SystemHandler(systemsName[i], groupName, system, i, systemsName.length);
            group.push(systemHandler);
        }
        this.#groups[groupName] = group;

        return this;
    }

    removeFromGroup(groupName, systemName) {
        this.#groups[groupName] = this.#groups[groupName].filter(systemHandler => systemHandler.systemName != systemName);
        this.#updateIndexAndSizeForEachHandler(groupName);

        return this;
    }

    removeSystem(systemName) {
        for(let groupName of Object.keys(this.#groups)) {
            this.removeFromGroup(groupName, systemName);
        }
        this.#registeredSystems = this.#registeredSystems.filter(registeredSystem => registeredSystem.systemName != systemName);
        
        return this;
    }

    updateGroup(groupName) {
        const group = this.#groups[groupName];
        if(group) {
            const groupCopy = group.map(systemHandler => systemHandler.clone());
            groupCopy.forEach(systemHandler => systemHandler.system.update(systemHandler, this.#world));
        }
    }


    #getOrCreateGroup(groupName) {
        return this.#groups[groupName] ?? (this.#groups[groupName] = []);
    }

    #tryGetSystem(systemName) {
        const registeredSystem = this.#getRegisteredSystem(systemName);
        if(!registeredSystem) {
            throw new exceptions.UnknownSystemException(`There is not system with name '${systemName}'.`);
        }
        return registeredSystem.system;
    }

    #getRegisteredSystem(systemName) {
        return this.#registeredSystems.find(registeredSystem => registeredSystem.systemName == systemName);
    }

    #updateIndexAndSizeForEachHandler(groupName) {
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