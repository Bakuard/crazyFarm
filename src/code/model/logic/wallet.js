'use strict'

module.exports.Wallet = class Wallet {
    constructor(sum, fertilizerPrice, sprayerPrice, seedsPrice) {
        this.sum = sum;
        this.fertilizerPrice = fertilizerPrice;
        this.sprayerPrice = sprayerPrice;
        this.seedsPrice = seedsPrice;
    }
}