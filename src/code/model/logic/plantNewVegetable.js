'use strict'

const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {Wallet} = require('./wallet.js');

module.exports.PlantNewVegetableSystem = class PlantNewVegetableSystem {
    constructor(randomGenerator) {
        this.randomGenerator = randomGenerator;
    }

    update(systemName, groupName, world) {
        const manager = world.getEntityComponentManager();
        const buffer = manager.createCommandBuffer();
        const eventManager = world.getEventManager();
        const wallet = manager.getSingletonEntity('wallet').get(Wallet);
        const fabric = manager.getSingletonEntity('fabric');
        const grid = manager.getSingletonEntity('grid');

        eventManager.forEachEvent('seeds', (event) => { 
            if(!grid.get(event.cellX, event.cellY) && wallet.sum >= wallet.seedsPrice) {
                const vegetable = buffer.createEntity();
                const metaComp = fabric.vegetableMeta(this.randomGenerator());
                const cellLinkComp = new GardenBedCellLink(event.cellX, event.cellY);
                const vegetableState = fabric.vegetableState(metaComp.typeName);
                vegetable.put(metaComp, cellLinkComp, vegetableState);
                grid.write(event.cellX, event.cellY, vegetable);
                wallet.sum -= wallet.seedsPrice;

                buffer.bindEntity(vegetable);

                eventManager.setFlag('gameStateWasChangedEvent');
            }
        });

        manager.flush(buffer);
        eventManager.clearEventQueue('seeds');
    }
};