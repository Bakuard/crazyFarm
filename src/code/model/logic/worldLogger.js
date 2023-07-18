'use strict'

const {VegetableMeta} = require('./vegetableMeta');
const {newLogger} = require('../../conf/logConf.js');
const util = require('util');

let logger = newLogger('info', 'worldLogger.js');

module.exports.WorldLogger = class WorldLogger {
    constructor(entityComponentManager, userId) {
        this.filter = entityComponentManager.createFilter().all(VegetableMeta);
        this.userId = userId;
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let gameLoop = world.getGameLoop();

        let empty = true;
        for(let vegetable of manager.select(this.filter)) {
            logger.info(`userId=%s; tick=%s; %s}`, this.userId, gameLoop.getFrameNumberSinceStart(), vegetable.toDetailString());

            empty = false;
        }

        if(empty) logger.info('userId=%s; tick=%s; there are not vegetables', this.userId,  gameLoop.getFrameNumberSinceStart());
    }
};