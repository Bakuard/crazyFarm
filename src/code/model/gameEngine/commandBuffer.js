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

    bind(entity) {
        this.#commandsQueue.push({
            type: 'bind',
            entity: entity
        });
    }

    remove(entity) {
        this.#commandsQueue.push({
            type: 'remove',
            entity: entity
        });
    }

    forEach(callback) {
        this.#commandsQueue.forEach(callback);
    }

};