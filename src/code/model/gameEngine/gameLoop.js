'use strict'

const groups = Object.freeze({
    start: 'start',
    update: 'update',
    stop: 'stop'
});
module.exports.groups = groups;

module.exports.FixedInterval = class FixedInterval {
    constructor(timeInMillis) {
        this.currentTime = 0;
        this.timeInMillis = timeInMillis;
    }

    execute(callback, elapsedTime) {
        this.currentTime += elapsedTime;
        let isElapsed = this.currentTime >= this.timeInMillis;
        while(isElapsed) {
            this.currentTime -= this.timeInMillis;
            isElapsed = this.currentTime >= this.timeInMillis;
            callback();
        }
    }
};

module.exports.GameLoop = class GameLoop {
    #state;
    #elapsedTime;
    #loopId;
    #timeUtil;
    #world;
    #frameDurationInMillis;
    #frameNumberSinceStart;

    constructor(world, frameDurationInMillis, timeUtil) {
        this.#state = 'init';
        this.#elapsedTime = 0;
        this.#world = world;
        this.#frameDurationInMillis = frameDurationInMillis;
        this.#frameNumberSinceStart = 0;
        this.#timeUtil = timeUtil;
    }

    start() {
        if(this.#state == 'init') {
            this.#state = 'update';
            this.#world.getSystemManager().updateGroup(groups.start, this.#world);
            let lastTime = this.#timeUtil.now();
            this.#loopId = this.#timeUtil.infiniteLoop(() => {
                let currentTime = this.#timeUtil.now();
                this.#elapsedTime = currentTime - lastTime;
                lastTime = currentTime;
                
                if(this.#state == 'update') {
                    this.#world.getSystemManager().updateGroup(groups.update, this.#world);
                    ++this.#frameNumberSinceStart;
                }
            }, this.#frameDurationInMillis);
        }
    }

    stop() {
        if(this.#state == 'update') {
            this.#state = 'init';
            this.#timeUtil.stopLoop(this.#loopId);
            this.#world.getSystemManager().updateGroup(groups.stop, this.#world);
        }
    }

    getState() {
        return this.#state;
    }

    getElapsedTime() {
        return this.#elapsedTime;
    }

    getFrameNumberSinceStart() {
        return this.#frameNumberSinceStart;
    }

};