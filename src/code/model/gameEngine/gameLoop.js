'use strict'

const groups = Object.freeze({
    start: 'start',
    update: 'update',
    stop: 'stop'
});
module.exports.groups = groups;

module.exports.GameLoop = class GameLoop {
    #state;
    #elapsedTime;
    #timerId;
    #world;
    #frameDurationInMillis;

    constructor(world, frameDurationInMillis) {
        this.#state = 'init';
        this.#elapsedTime = 0;
        this.#world = world;
        this.#frameDurationInMillis = frameDurationInMillis;
    }

    start() {
        if(this.#state == 'init') {
            this.#state = 'update';
            this.#world.systemManager.updateGroup(groups.start, this.#world);
            let lastTime = Date.now();
            this.#timerId = setInterval(() => {
                let currentTime = Date.now();
                this.#elapsedTime = currentTime - lastTime;
                lastTime = currentTime;
                
                if(this.#state == 'update') this.#world.systemManager.updateGroup(groups.update, this.#world);
            }, this.#frameDurationInMillis);
        }
    }

    stop() {
        if(this.#state == 'update') {
            this.#state = 'init';
            clearInterval(this.#timerId);
            this.#world.systemManager.updateGroup(groups.stop, this.#world);
        }
    }

    getState() {
        return this.#state;
    }

    getElapsedTime() {
        return this.#elapsedTime;
    }

};