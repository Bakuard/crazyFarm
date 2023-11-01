'use strict'

module.exports.InitSystem = class InitSystem {

    constructor(fabric) {
        this.fabric = fabric;
    }

    update(systemName, groupName, world) {
        const manager = world.getEntityComponentManager();

        const grid = this.fabric.grid();
        const wallet = manager.createEntity().put(this.fabric.wallet());

        manager.putSingletonEntity('fabric', this.fabric);
        manager.putSingletonEntity('grid', grid);
        manager.putSingletonEntity('wallet', wallet);
    }

};