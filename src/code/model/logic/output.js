'use strict'

const {Wallet} = require('./wallet.js');
const dto = require('../../dto/dto.js');

module.exports.OutputSystem = class OutputSystem {
    constructor(callback) {
        this.callback = callback;
    }

    update(groupName, world) {
        const manager = world.getEntityComponentManager();
        const wallet = manager.getSingletonEntity('wallet').get(Wallet);
        const grid = manager.getSingletonEntity('grid');
        const response = new dto.GameResponse(grid, wallet);
        this.callback(response);
    }
};