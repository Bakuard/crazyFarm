'use strict'

const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {Wallet} = require('./wallet.js');

module.exports.PlantNewVegetableSystem = class PlantNewVegetableSystem {
    constructor(randomGenerator) {
        this.randomGenerator = randomGenerator;
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();
        let eventManager = world.getEventManager();
        let wallet = manager.getSingletonEntity('wallet').get(Wallet);
        let fabric = manager.getSingletonEntity('fabric');
        let grid = manager.getSingletonEntity('grid');

        eventManager.forEachEvent('seeds', (event, index) => { 
            if(!grid.get(event.cellX, event.cellY) && wallet.sum >= wallet.seedsPrice) {
                let vegetable = buffer.createEntity();
                let metaComp = fabric.vegetableMeta(this.randomGenerator());
                let cellLinkComp = new GardenBedCellLink(event.cellX, event.cellY);
                let vegetableState = fabric.vegetableState(metaComp.typeName);
                vegetable.put(metaComp, cellLinkComp, vegetableState);
                grid.write(event.cellX, event.cellY, vegetable);
                wallet.sum -= wallet.seedsPrice;

                buffer.bindEntity(vegetable);
            }
        });

        manager.flush(buffer);
        eventManager.clearEventQueue('seeds');
    }
};