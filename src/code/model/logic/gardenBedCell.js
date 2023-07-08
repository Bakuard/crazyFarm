'use strict'

module.exports.GardenBedCell = class GardenBedCell {
    static of(positionX, positionY) {
        return new GardenBedCell(positionX, positionY, null);
    }

    constructor(positionX, positionY, vegetable) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.vegetable = vegetable;
    }
};