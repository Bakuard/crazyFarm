'use strict'

const {GardenBedCell} = require('./gardenBedCell.js');

module.exports.OutputSystem = class OutputSystem {
    constructor(entityComponentManager, callback) {
        this.filter = entityComponentManager.createFilter().all(GardenBedCell);
        this.callback = callback;
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let result = [...manager.select(this.filter)];
        this.callback(result);
    }
};