'use strict'

const {GardenBedCell} = require('./gardenBedCell.js');
const {Wallet} = require('./wallet.js');

module.exports.InitLogicSystem = class InitLogicSystem {

    constructor(fabric) {
        this.fabric = fabric;
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();

        let cell = manager.createEntity().put(GardenBedCell.of(0, 0));
        manager.bindEntity(cell);

        let wallet = manager.createEntity();
        wallet.put(this.fabric.wallet());
        manager.putSingletonEntity('wallet', wallet);
    }

};