'use strict'

const {VegetableMeta} = require('./vegetableMeta');
const {newLogger} = require('../../conf/logConf.js');
const {Wallet} = require('./wallet.js');

const logger = newLogger('info', 'worldLogger.js');

module.exports.WorldLogger = class WorldLogger {
    constructor(entityComponentManager, user) {
        this.filter = entityComponentManager.createFilter().all(VegetableMeta);
        this.user = user;
    }

    update(systemHandler, world) {
        const manager = world.getEntityComponentManager();
        const gameLoop = world.getGameLoop();
        const wallet = manager.getSingletonEntity('wallet').get(Wallet);

        let empty = true;
        for(let vegetable of manager.select(this.filter)) {
            logger.info(`userId=%s; isTutorial=%s; tick=%s; wallet=%s; %s}`, 
                            this.user._id, 
                            !this.user.isTutorialFinished,
                            gameLoop.getFrameNumberSinceStart(), 
                            wallet.sum,
                            vegetable.toDetailString()
            );

            empty = false;
        }

        if(empty) {
            logger.info('userId=%s; isTutorial=%s; tick=%s; wallet=%s; there are not vegetables', 
                            this.user._id,
                            !this.user.isTutorialFinished,  
                            gameLoop.getFrameNumberSinceStart(),
                            wallet.sum
            );
        }
    }
};