'use strict'

const {Wallet} = require('./wallet.js');
const dto = require('../../dto/dto.js');

module.exports.OutputSystem = class OutputSystem {
    constructor(debug, callback) {
        this.debug = debug;
        this.callback = callback;
    }

    update(systemHandler, world) {
        const eventManager = world.getEventManager();
        const manager = world.getEntityComponentManager();
        const wallet = manager.getSingletonEntity('wallet').get(Wallet);
        const grid = manager.getSingletonEntity('grid');
        const tutorial = manager.getSingletonEntity('tutorialCurrentStep');
        
        if(this.debug || eventManager.hasFlag('gameStateWasChangedEvent')) {
            const response = new dto.GameResponse(grid, wallet, tutorial);
            this.callback(response);
            eventManager.clearFlag('gameStateWasChangedEvent');
        }
    }
};