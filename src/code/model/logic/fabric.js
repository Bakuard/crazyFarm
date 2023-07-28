'use strict'

const {PotatoGhost} = require('./potatoDeath.js');
const {GrowTimer, growStates} = require('./growTimer.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {UnknownVegetableType, FailToCreateVegetableMeta} = require('../exception/exceptions.js');
const {Wallet} = require('./wallet.js');
const {VegetablePrice} = require('./vegetablePrice.js');
const {VegetableMeta} = require('./vegetableMeta.js');

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
        },
        seedProbability: {
            min: 0.7,
            max: 1
        },
        meta: {
            typeName: 'Potato'
        }
    },
    tomato: {
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
            coff: 2
        },
        seedProbability: {
            min: 0,
            max: 0.7
        },
        meta: {
            typeName: 'Tomato'
        }
    },
    wallet: {
        sum: 20,
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
        let vegetableSettings = null;

        if(vegetableTypeName == 'Potato') vegetableSettings = this.settings.potato;
        else if(vegetableTypeName == 'Tomato') vegetableSettings = this.settings.tomato;
        else throw new UnknownVegetableType(`Unknown vegetable type: ${vegetableTypeName}`);

        return GrowTimer.of(
            growState ?? vegetableSettings.growTimer.state, 
            structuredClone(vegetableSettings.growTimer.intervalsInSeconds)
        );
    }

    thirst(vegetableTypeName) {
        let vegetableSettings = null;

        if(vegetableTypeName == 'Potato') vegetableSettings = this.settings.potato;
        else if(vegetableTypeName == 'Tomato') vegetableSettings = this.settings.tomato;
        else throw new UnknownVegetableType(`Unknown vegetable type: ${vegetableTypeName}`);

        return Thirst.of(
            vegetableSettings.thirst.max, 
            vegetableSettings.thirst.declineRatePerSeconds
        );
    }

    satiety(vegetableTypeName) {
        let vegetableSettings = null;

        if(vegetableTypeName == 'Potato') vegetableSettings = this.settings.potato;
        else if(vegetableTypeName == 'Tomato') vegetableSettings = this.settings.tomato;
        else throw new UnknownVegetableType(`Unknown vegetable type: ${vegetableTypeName}`);

        return Satiety.of(
            vegetableSettings.satiety.max, 
            vegetableSettings.satiety.declineRatePerSeconds
        );
    }

    immunity(vegetableTypeName) {
        let vegetableSettings = null;

        if(vegetableTypeName == 'Potato') vegetableSettings = this.settings.potato;
        else if(vegetableTypeName == 'Tomato') vegetableSettings = this.settings.tomato;
        else throw new UnknownVegetableType(`Unknown vegetable type: ${vegetableTypeName}`);

        return Immunity.of(
            vegetableSettings.immunity.max, 
            vegetableSettings.immunity.declineRatePerSeconds,
            vegetableSettings.immunity.probability
        );
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
        else if(vegetableTypeName == 'Tomato') vegetableSettings = this.settings.tomato;
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

    vegetableMeta(randomNumber) {
        for(let value of Object.values(this.settings)) {
            if(value.seedProbability && 
                randomNumber >= value.seedProbability.min &&
                randomNumber <= value.seedProbability.max) {
                return new VegetableMeta(value.meta.typeName);
            }
        }
        throw new FailToCreateVegetableMeta(`There are not vegetables for randomNumber: ${randomNumber}`);
    }


    setSettings(settings) {
        this.settings = settings;
    }

    getSettings() {
        return this.settings;
    }

};