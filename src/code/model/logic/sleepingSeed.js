'use strict'

const {VegetableMeta} = require('./vegetableMeta');
const {GardenBedCell} = require('./gardenBedCell.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {Wallet} = require('./wallet.js');

module.exports.SleepingSeedSystem = class SleepingSeedSystem {

    constructor(entityComponentManager, fabric) {
        this.cellFilter = entityComponentManager.createFilter().all(GardenBedCell);
        this.vegetableFilter = entityComponentManager.createFilter().allTags('sleeping seed');
        this.fabric = fabric;
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();
        let eventManager = world.getEventManager();
        let wallet = manager.getSingletonEntity('wallet').get(Wallet);

        if(eventManager.readEvent('seeds', 0)) {
            for(let entity of manager.select(this.cellFilter)) {
                let cell = entity.get(GardenBedCell);

                if(cell && !cell.entity && wallet.sum >= wallet.seedsPrice) {
                    let vegetable = buffer.createEntity();
                    vegetable.put(new VegetableMeta('Potato'), new GardenBedCellLink(entity)).
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
                entity.removeTags('sleeping seed').
                    put(
                        this.fabric.growTimer('Potato'),
                        this.fabric.thirst('Potato'),
                        this.fabric.satiety('Potato'),
                        this.fabric.immunity('Potato')
                    );
                buffer.bindEntity(entity);
            }
        }

        manager.flush(buffer);
        eventManager.clearEventQueue('seeds');
    }

};