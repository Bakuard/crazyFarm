'use strict'

const e = require("express");

module.exports.CommandBuffer = class CommandBuffer {

    #commandsQueue;
    #entityManager;

    constructor(entityManager) {
        this.#commandsQueue = [];
        this.#entityManager = entityManager;
    }

    create() {
        return this.#entityManager.create();
    }

    bind(entityClone) {
        this.#commandsQueue.push({
            type: 'bind',
            entity: entityClone
        });
    }

    remove(entity) {
        this.#commandsQueue.push({
            type: 'remove',
            entity: entity
        });
    }

    clear() {
        this.#commandsQueue.length = 0;
    }

    forEach(callback) {
        this.#commandsQueue.forEach(command => callback(command));
    }

};