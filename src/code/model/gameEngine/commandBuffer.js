'use strict'

const e = require("express");

module.exports.CommandBuffer = class CommandBuffer {

    #commandsQueue;
    #entityManager;

    constructor(entityManager) {
        this.#commandsQueue = [];
        this.#entityManager = entityManager;
    }

    createEntity() {
        return this.#entityManager.create();
    }

    bindEntity(entityClone) {
        this.#commandsQueue.push({
            type: 'bind',
            entity: entityClone
        });
    }

    removeEntity(entity) {
        this.#commandsQueue.push({
            type: 'remove',
            entity: entity
        });
    }

    clearCommands() {
        this.#commandsQueue.length = 0;
    }

    isEmpty() {
        return this.#commandsQueue.length == 0;
    }

    forEach(callback) {
        this.#commandsQueue.forEach(command => callback(command));
    }

};