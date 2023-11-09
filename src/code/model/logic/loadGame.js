'use strict'

const {Entity} = require('../gameEngine/entity.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {newLogger} = require('../../conf/logConf.js');

let logger = newLogger('info', 'loadGame.js');

module.exports.LoadGameSystem = class LoadGameSystem {
    constructor(userId) {
        this.userId = userId;
    }

    update(systemHandler, world) {
        const eventManager = world.getEventManager();
        const manager = world.getEntityComponentManager();
        const entityManager = manager.getEntityManager();

        const fabric = manager.getSingletonEntity('fabric');
        const grid = manager.getSingletonEntity('grid');
        const wallet = manager.getSingletonEntity('wallet');
        const fullGameState = manager.getSingletonEntity('fullGameState');

        const loadEntity = this.#loadEntity;
        if(fullGameState) {
            wallet.put(fabric.restoreComponentBy('Wallet', fullGameState.wallet));
            let snapshot = {
                liveEntities: fullGameState.liveEntities.map(e => loadEntity(fabric, e)),
                deadEntities: fullGameState.deadEntities.map(e => loadEntity(fabric, e))
            };
            entityManager.restore(snapshot);     
            snapshot.liveEntities.forEach(entity => {
                if(entity.hasComponents(GardenBedCellLink)) {
                    let cellLink = entity.get(GardenBedCellLink);
                    grid.write(cellLink.cellX, cellLink.cellY, entity);
                    manager.bindEntity(entity);
                }
            });

            manager.putSingletonEntity('fullGameState', null);

            eventManager.setFlag('gameStateWasChangedEvent');

            logger.info('Load game for user %s', this.userId);
        }
    }

    #loadEntity(fabric, entityLoadedImage) {
        let entity = new Entity(entityLoadedImage.personalId, entityLoadedImage.generation);
        entity.addTags(...entityLoadedImage.tags);
        for(let [compName, compLoadedImage] of Object.entries(entityLoadedImage.components)) {
            entity.put(fabric.restoreComponentBy(compName, compLoadedImage));
        }
        return entity;
    }
};