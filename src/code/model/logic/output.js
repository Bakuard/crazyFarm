'use strict'

const {GardenBedCell} = require('./gardenBedCell.js');
const {newLogger} = require('../../conf/logConf.js');

let logger = newLogger('info', 'output.js');

module.exports.OutputSystem = class OutputSystem {
    constructor(entityComponentManager, callback) {
        this.filter = entityComponentManager.createFilter().all(GardenBedCell);
        this.callback = callback;
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let result = [...manager.select(this.filter)];
        logger.info('output result=%s', JSON.stringify(result));
        this.callback(result);
    }
};