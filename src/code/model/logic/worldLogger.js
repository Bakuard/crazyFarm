'use strict'

const {VegetableMeta} = require('./vegetableMeta');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {newLogger} = require('../../conf/logConf.js');

let logger = newLogger('info', 'worldLogger.js');

module.exports.WorldLogger = class WorldLogger {
    constructor(entityComponentManager, userId) {
        this.filter = entityComponentManager.createFilter().all(VegetableMeta);
        this.userId = userId;
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();

        let empty = true;
        for(let vegetable of manager.select(this.filter)) {
            logger.info('Updated world for userId=%s', this.userId);

            let res = `{personalId: ${vegetable.personalId}, generation: ${vegetable.generation}, tags=`;
            res.tags = [];
            vegetable.forEachTag(tag => res.tags.push(tag));
            res = res + tags.toString() + ', ';
            vegetable.forEachComponent(c => {
                res += Object.getPrototypeOf(c).constructor.name;
            });
            logger.info(`entity for userId=%s: %s}`, this.userId, res);

            empty = false;
        }

        if(empty) logger.info('empty garden cell for userId=%s', this.userId);
    }
};