'use strict'

const {PotatoGhost} = require('./potatoDeath.js');
const {GrowTimer, growStates} = require('./growTimer.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {UnknownVegetableType} = require('../exception/exceptions.js');
const {Wallet} = require('./wallet.js');

const defaultSettings = {
    potato: {
        ghost: {
            timeInMillis: 10000
        },
        immunity: {
            max: 60,
            declineRatePerSeconds: 1,
            probability: 0.2
        },
        satiety: {
            max: 60,
            declineRatePerSeconds: 1
        },
        thirst: {
            max: 60,
            declineRatePerSeconds: 1
        },
        growTimer: {
            state: growStates.seed,
            intervalsInSeconds: [3, 40, 40, 40, 40]
        }
    },
    wallet: {
        sum: 10
    },
    fertilizer: {
        price: 1
    },
    sprayer: {
        price: 2
    },
    seeds: {
        price: 3
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

    growTimer(vegetableTypeName) {
        if(vegetableTypeName == 'Potato') {
            return GrowTimer.of(
                this.settings.potato.growTimer.state, 
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
            this.settings.fertilizer.price,
            this.settings.sprayer.price,
            this.settings.seeds.price
        );
    }


    setSettings(settings) {
        this.settings = settings;
    }

    getSettings() {
        return this.settings;
    }

};