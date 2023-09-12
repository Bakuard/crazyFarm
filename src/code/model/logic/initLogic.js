'use strict'

const {Fabric} = require('./fabric.js');

module.exports.InitLogicSystem = class InitLogicSystem {

    constructor(settings) {
        this.settings = settings;
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();

        let fabric = this.settings ? new Fabric(this.settings) : Fabric.createWithDefaultSettings();
        let grid = fabric.grid();
        let wallet = manager.createEntity().put(fabric.wallet());

        manager.putSingletonEntity('fabric', fabric);
        manager.putSingletonEntity('grid', grid);
        manager.putSingletonEntity('wallet', wallet);
    }

};