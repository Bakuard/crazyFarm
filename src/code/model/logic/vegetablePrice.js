'use strict'

module.exports.VegetablePrice = class VegetablePrice {
    constructor(vegetableTypeName, growState, price) {
        this.vegetableTypeName = vegetableTypeName;
        this.growState = growState;
        this.price = price;
    }
};