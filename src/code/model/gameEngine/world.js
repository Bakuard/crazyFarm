'use strict'

const {EntityComponentManager} = require('./entityComponentManager.js');
const {ComponentIdGenerator} = require('./componentIdGenerator.js');
const {EntityManager} = require('./entityManager.js');
const {SystemManager} = require('./systemManager.js');
const {EventManager} = require('./eventManager.js');
const {GameLoop} = require('./gameLoop.js');

module.exports.World = class World {
    #entityComponentManager;
    #systemManager;
    #eventManager;
    #gameLoop;

    constructor(frameDurationPerMillis, timeUtil) {
        this.#entityComponentManager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
        this.#systemManager = new SystemManager(this);
        this.#eventManager = new EventManager();
        this.#gameLoop = new GameLoop(this, frameDurationPerMillis, timeUtil);
    }

    getEntityComponentManager() {
        return this.#entityComponentManager;
    }

    getSystemManager() {
        return this.#systemManager;
    }

    getEventManager() {
        return this.#eventManager;
    }

    getGameLoop() {
        return this.#gameLoop;
    }

};