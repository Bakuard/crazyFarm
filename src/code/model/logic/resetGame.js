'use strict'

module.exports.ResetGameSystem = class ResetGameSystem {
    constructor(gridFabric, walletFabric) {
        this.gridFabric = gridFabric;
        this.walletFabric = walletFabric;
    }

    update(systemHandler, world) {
        const manager = world.getEntityComponentManager();
        const eventManager = world.getEventManager();

        if(eventManager.eventsNumber('resetGame') > 0) {
            const grid = this.gridFabric();
            const wallet = manager.createEntity().put(this.walletFabric());

            manager.clear();
            manager.putSingletonEntity('grid', grid);
            manager.putSingletonEntity('wallet', wallet);
            manager.putSingletonEntity('tutorialCurrentStep', null);

            eventManager.clearEventQueue('resetGame');
            eventManager.setFlag('gameStateWasChangedEvent');
        }
    }
};