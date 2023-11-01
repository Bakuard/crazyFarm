'use strict'

const {Wallet} = require('./wallet.js');

module.exports.ChangeObserverSystem = class ChangeObserverSystem {
    constructor() {

    }

    update(systemName, groupName, world) {
        const manager = world.getEntityComponentManager();
        const wallet = manager.getSingletonEntity('wallet').get(Wallet);
        const grid = manager.getSingletonEntity('grid');

        
    }
};
