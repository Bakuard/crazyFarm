'use strict'

const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {Wallet} = require('./wallet.js');

module.exports.PlantNewVegetableSystem = class PlantNewVegetableSystem {
    constructor(vegetableMetaFabric, vegetableStateFabric) {
        this.vegetableMetaFabric = vegetableMetaFabric;
        this.vegetableStateFabric = vegetableStateFabric;
    }

    update(systemHandler, world) {
        const manager = world.getEntityComponentManager();
        const buffer = manager.createCommandBuffer();
        const eventManager = world.getEventManager();
        const wallet = manager.getSingletonEntity('wallet').get(Wallet);
        const grid = manager.getSingletonEntity('grid');

        eventManager.forEachEvent('seeds', event => { 
            if(!grid.get(event.cellX, event.cellY) && wallet.sum >= wallet.seedsPrice) {
                const vegetable = this.#createNewVegetable(buffer, event);
                grid.write(event.cellX, event.cellY, vegetable);

                wallet.sum -= wallet.seedsPrice;

                eventManager.setFlag('gameStateWasChangedEvent');
            }
        });

        manager.flush(buffer);
        eventManager.clearEventQueue('seeds');
    }

    #createNewVegetable(buffer, event) {
        const vegetable = buffer.createEntity();

        const metaComp = this.vegetableMetaFabric();
        const cellLinkComp = new GardenBedCellLink(event.cellX, event.cellY);
        const vegetableState = this.vegetableStateFabric(metaComp.typeName);
        vegetable.put(metaComp, cellLinkComp, vegetableState);

        buffer.bindEntity(vegetable);

        return vegetable;
    }
};
