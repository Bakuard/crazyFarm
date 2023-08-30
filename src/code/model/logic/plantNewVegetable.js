'use strict'

const {GardenBedCell} = require('./gardenBedCell.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {Wallet} = require('./wallet.js');

module.exports.PlantNewVegetableSystem = class PlantNewVegetableSystem {
    constructor(entityComponentManager, randomGenerator) {
        this.cellFilter = entityComponentManager.createFilter().all(GardenBedCell);
        this.randomGenerator = randomGenerator;
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();
        let eventManager = world.getEventManager();
        let wallet = manager.getSingletonEntity('wallet').get(Wallet);
        let fabric = manager.getSingletonEntity('fabric');

        if(eventManager.readEvent('seeds', 0)) {
            for(let entityWithCellComp of manager.select(this.cellFilter)) {
                let cell = entityWithCellComp.get(GardenBedCell);
                
                if(cell && !cell.entity && wallet.sum >= wallet.seedsPrice) {
                    let vegetable = buffer.createEntity();
                    let metaComp = fabric.vegetableMeta(this.randomGenerator());
                    let cellLinkComp = new GardenBedCellLink(entityWithCellComp);
                    let vegetableState = fabric.vegetableState(metaComp.typeName);
                    vegetable.put(metaComp, cellLinkComp, vegetableState);
                    cell.entity = vegetable;
                    wallet.sum -= wallet.seedsPrice;

                    buffer.bindEntity(vegetable);
                    buffer.bindEntity(entityWithCellComp);
                }
            }
        }

        manager.flush(buffer);
        eventManager.clearEventQueue('seeds');
    }
};