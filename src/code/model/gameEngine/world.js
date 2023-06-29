'use strict'

const {EntityComponentManager} = require('./entityComponentManager.js');
const {EntityManager} = require('./entityManager.js');
const {SystemManager} = require('./systemManager.js');
const {EventManager} = require('./eventManager.js');
const {GameLoop} = require('./gameLoop.js');

module.exports.Word = class World {
    #entityComponentManager;
    #systemManager;
    #eventManager;
    #gameLoop;

    constructor(frameDurationPerMillis) {
        this.#entityComponentManager = new EntityComponentManager(new EntityManager());
        this.#systemManager = new SystemManager(this);
        this.#eventManager = new EventManager();
        this.#gameLoop = new GameLoop(this, frameDurationPerMillis);
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