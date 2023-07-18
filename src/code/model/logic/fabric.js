'use strict'

const {PotatoGhost} = require('./potatoDeath.js');
const {GrowTimer, growStates} = require('./growTimer.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {UnknownVegetableType} = require('../exception/exceptions.js');
const {Wallet} = require('./wallet.js');
const { VegetablePrice } = require('./vegetablePrice.js');

const defaultSettings = {
    potato: {
        ghost: {
            timeInMillis: 10000
        },
        immunity: {
            max: 60,
            alertLevel1: 30,
            declineRatePerSeconds: 1,
            probability: 0.2
        },
        satiety: {
            max: 60,
            alertLevel1: 30,
            declineRatePerSeconds: 1
        },
        thirst: {
            max: 60,
            alertLevel1: 30,
            declineRatePerSeconds: 1
        },
        growTimer: {
            state: growStates.seed,
            intervalsInSeconds: [3, 40, 40, 40, 40]
        },
        price: {
            coff: 1.5
        }
    },
    wallet: {
        sum: 10,
        fertilizerPrice: 2,
        sprayerPrice: 2,
        seedsPrice: 3
    }
};
module.exports.defaultSettings = defaultSettings;

module.exports.Fabric = class Fabric {

    static createWithDefaultSettings() {
        return new Fabric(defaultSettings);
    }

    constructor(settings) {
        this.settings = settings;
    }

    potatoGhost() {
        return new PotatoGhost(this.settings.potato.ghost.timeInMillis);
    }

    growTimer(vegetableTypeName, growState) {
        if(vegetableTypeName == 'Potato') {
            return GrowTimer.of(
                growState ?? this.settings.potato.growTimer.state, 
                structuredClone(this.settings.potato.growTimer.intervalsInSeconds)
            );
        } else {
            throw new UnknownVegetableType(`Unknown vegetable type: ${vegetableTypeName}`);
        }
    }

    thirst(vegetableTypeName) {
        if(vegetableTypeName == 'Potato') {
            return Thirst.of(
                this.settings.potato.thirst.max, 
                this.settings.potato.thirst.declineRatePerSeconds
            );
        } else {
            throw new UnknownVegetableType(`Unknown vegetable type: ${vegetableTypeName}`);
        }
    }

    satiety(vegetableTypeName) {
        if(vegetableTypeName == 'Potato') {
            return Satiety.of(
                this.settings.potato.satiety.max, 
                this.settings.potato.satiety.declineRatePerSeconds
            );
        } else {
            throw new UnknownVegetableType(`Unknown vegetable type: ${vegetableTypeName}`);
        }
    }

    immunity(vegetableTypeName) {
        if(vegetableTypeName == 'Potato') {
            return Immunity.of(
                this.settings.potato.immunity.max, 
                this.settings.potato.immunity.declineRatePerSeconds,
                this.settings.potato.immunity.probability
            );
        } else {
            throw new UnknownVegetableType(`Unknown vegetable type: ${vegetableTypeName}`);
        }
    }  

    wallet() {
        return new Wallet(
            this.settings.wallet.sum,
            this.settings.wallet.fertilizerPrice,
            this.settings.wallet.sprayerPrice,
            this.settings.wallet.seedsPrice
        );
    }

    vegetablePrice(vegetableTypeName, growState) {
        let vegetableSetting = null;

        if(vegetableTypeName == 'Potato') vegetableSetting = this.settings.potato;
        else throw new UnknownVegetableType(`Uknown vegetable type ${vegetableTypeName}`);

        let totalSecondInterval = 0;
        for(let i = 0; i <= growState.ordinal; i++) {
            totalSecondInterval += vegetableSetting.growTimer.intervalsInSeconds[i];
        }

        let price = (totalSecondInterval / vegetableSetting.satiety.alertLevel1 * this.settings.wallet.fertilizerPrice +
                     totalSecondInterval / vegetableSetting.immunity.alertLevel1 * this.settings.wallet.sprayerPrice +
                     this.settings.wallet.seedsPrice) * vegetableSetting.price.coff;
        return new VegetablePrice(vegetableTypeName, growState, Math.ceil(price)); 
    }


    setSettings(settings) {
        this.settings = settings;
    }

    getSettings() {
        return this.settings;
    }

};