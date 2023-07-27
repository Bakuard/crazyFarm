'use strict'

const {VegetableMeta} = require('./vegetableMeta');
const {GardenBedCell} = require('./gardenBedCell.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {Wallet} = require('./wallet.js');

module.exports.SleepingSeedSystem = class SleepingSeedSystem {

    constructor(entityComponentManager, randomGenerator) {
        this.cellFilter = entityComponentManager.createFilter().all(GardenBedCell);
        this.vegetableFilter = entityComponentManager.createFilter().allTags('sleeping seed');
        this.randomGenerator = randomGenerator;
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();
        let eventManager = world.getEventManager();
        let wallet = manager.getSingletonEntity('wallet').get(Wallet);
        let fabric = manager.getSingletonEntity('fabric');

        if(eventManager.readEvent('seeds', 0)) {
            for(let entity of manager.select(this.cellFilter)) {
                let cell = entity.get(GardenBedCell);

                if(cell && !cell.entity && wallet.sum >= wallet.seedsPrice) {
                    let vegetable = buffer.createEntity();
                    vegetable.put(
                            fabric.vegetableMeta(this.randomGenerator()), 
                            new GardenBedCellLink(entity)
                        ).
                        addTags('sleeping seed');
                    cell.entity = vegetable;
                    wallet.sum -= wallet.seedsPrice;

                    buffer.bindEntity(vegetable);
                    buffer.bindEntity(entity);
                }
            }
        }

        for(let entity of manager.select(this.vegetableFilter)) {
            if(eventManager.readEvent('bailer', 0)) {
                let meta = entity.get(VegetableMeta);
                entity.removeTags('sleeping seed').
                    put(
                        fabric.growTimer(meta.typeName),
                        fabric.thirst(meta.typeName),
                        fabric.satiety(meta.typeName),
                        fabric.immunity(meta.typeName)
                    );
                buffer.bindEntity(entity);
            }
        }

        manager.flush(buffer);
        eventManager.clearEventQueue('seeds');
    }

};