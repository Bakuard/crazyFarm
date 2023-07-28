'use strict'

const {GardenBedCell} = require('./gardenBedCell.js');
const {Wallet} = require('./wallet.js');

module.exports.OutputSystem = class OutputSystem {
    constructor(entityComponentManager, callback) {
        this.filter = entityComponentManager.createFilter().all(GardenBedCell);
        this.callback = callback;
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let wallet = manager.getSingletonEntity('wallet').get(Wallet);
        let entities = [...manager.select(this.filter)];
        this.callback(entities, wallet);
    }
};