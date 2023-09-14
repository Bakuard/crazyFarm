'use strict'

const {Wallet} = require('./wallet.js');
const dto = require('../../dto/dto.js');

module.exports.OutputSystem = class OutputSystem {
    constructor(callback) {
        this.callback = callback;
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let wallet = manager.getSingletonEntity('wallet').get(Wallet);
        let grid = manager.getSingletonEntity('grid');
        this.callback(new dto.GameResponse(grid, wallet));
    }
};