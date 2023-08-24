'use strict'

module.exports.GardenBedCell = class GardenBedCell {
    static of(positionX, positionY) {
        return new GardenBedCell(positionX, positionY, null);
    }

    constructor(positionX, positionY, entity) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.entity = entity;
    }
};