'use strict'

const {GardenBedCell} = require('./gardenBedCell.js');
const {Fabric} = require('./fabric.js');

module.exports.InitLogicSystem = class InitLogicSystem {

    constructor() {}

    update(groupName, world) {
        let fabric = Fabric.createWithDefaultSettings();
        let manager = world.getEntityComponentManager();

        manager.putSingletonEntity('fabric', fabric);

        let cell = manager.createEntity().put(GardenBedCell.of(0, 0));
        manager.bindEntity(cell);

        let wallet = manager.createEntity();
        wallet.put(fabric.wallet());
        manager.putSingletonEntity('wallet', wallet);
    }

};