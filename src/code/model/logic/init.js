'use strict'

module.exports.InitSystem = class InitSystem {

    constructor(gridFabric, walletFabric) {
        this.gridFabric = gridFabric;
        this.walletFabric = walletFabric;
    }

    update(systemHandler, world) {
        const manager = world.getEntityComponentManager();

        const grid = this.gridFabric();
        const wallet = manager.createEntity().put(this.walletFabric());

        manager.putSingletonEntity('grid', grid);
        manager.putSingletonEntity('wallet', wallet);
    }

};