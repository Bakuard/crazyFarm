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
            if(this.#canPlant(grid, wallet, event)) {
                this.#createNewVegetable(buffer, grid, event);

                wallet.sum -= wallet.seedsPrice;

                eventManager.setFlag('gameStateWasChangedEvent');
            }
        });

        manager.flush(buffer);
        eventManager.clearEventQueue('seeds');
    }

    #canPlant(grid, wallet, event) {
        return !grid.get(event.cellX, event.cellY) && wallet.sum >= wallet.seedsPrice;
    }

    #createNewVegetable(buffer, grid, event) {
        const vegetable = buffer.createEntity();

        const metaComp = this.vegetableMetaFabric();
        const cellLinkComp = new GardenBedCellLink(event.cellX, event.cellY);
        const vegetableState = this.vegetableStateFabric(metaComp.typeName);
        vegetable.put(metaComp, cellLinkComp, vegetableState);

        buffer.bindEntity(vegetable);

        grid.write(event.cellX, event.cellY, vegetable);
    }
};
