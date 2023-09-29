'use strict'

const {Wallet} = require('./wallet.js');
const {newLogger} = require('../../conf/logConf.js');

let logger = newLogger('info', 'saveGame.js');

module.exports.SaveGameSystem = class SaveGameSystem {
    constructor(userId, gameRepository) {
        this.userId = userId;
        this.gameRepository = gameRepository;
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let wallet = manager.getSingletonEntity('wallet').get(Wallet);
        let snapshot = manager.getEntityManager().snapshot();

        let mapEntity = this.#mapEntity;
        let userId = this.userId;
        let fullGameState = {
            liveEntities: snapshot.liveEntities.map(mapEntity),
            deadEntities: snapshot.deadEntities.map(mapEntity),
            wallet,
            userId,
            timestamp: Date.now()
        };
        
        this.gameRepository.save(fullGameState).then(() => logger.info('Save game for user %s', userId));
    }

    #mapEntity(entity) {
        let result = {};
        result.personalId = entity.personalId;
        result.generation = entity.generation;
        result.components = {};
        result.tags = [];
        entity.forEachComponent(comp => {
            let key = Object.getPrototypeOf(comp).constructor.name;
            result.components[key] = comp;
        });
        entity.forEachTag(tag => result.tags.push(tag));
        return result;
    }
};