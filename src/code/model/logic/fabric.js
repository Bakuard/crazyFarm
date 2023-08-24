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
const {VegetableState, StateDetail, lifeCycleStates} = require('./vegetableState.js');

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
        },
        vegetableState: {
            seedDetail: {
                intervalInSecond: 3,
                lifeCyleState: 'seed'
            },
            sproutDetail: {
                intervalInSecond: 40,
                lifeCyleState: 'sprout'
            },
            chidlDetail: {
                intervalInSecond: 40,
                lifeCyleState: 'child'
            },
            youthDetail: {
                intervalInSecond: 40,
                lifeCyleState: 'youth'
            }
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
        },
        vegetableState: {
            seedDetail: {
                intervalInSecond: 3,
                lifeCyleState: 'seed'
            },
            sproutDetail: {
                intervalInSecond: 40,
                lifeCyleState: 'sprout'
            },
            chidlDetail: {
                intervalInSecond: 40,
                lifeCyleState: 'child'
            },
            youthDetail: {
                intervalInSecond: 40,
                lifeCyleState: 'youth'
            }
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
        let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

        return GrowTimer.of(
            growState ?? vegetableSettings.growTimer.state, 
            structuredClone(vegetableSettings.growTimer.intervalsInSeconds)
        );
    }

    thirst(vegetableTypeName) {
        let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

        return Thirst.of(
            vegetableSettings.thirst.max, 
            vegetableSettings.thirst.declineRatePerSeconds
        );
    }

    satiety(vegetableTypeName) {
        let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

        return Satiety.of(
            vegetableSettings.satiety.max, 
            vegetableSettings.satiety.declineRatePerSeconds
        );
    }

    immunity(vegetableTypeName) {
        let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

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
        let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

        let totalSecondInterval = 0;
        for(let i = 0; i <= growState.ordinal; i++) {
            totalSecondInterval += vegetableSettings.growTimer.intervalsInSeconds[i];
        }

        let price = (totalSecondInterval / vegetableSettings.satiety.alertLevel1 * this.settings.wallet.fertilizerPrice +
                     totalSecondInterval / vegetableSettings.immunity.alertLevel1 * this.settings.wallet.sprayerPrice +
                     this.settings.wallet.seedsPrice) * vegetableSettings.price.coff;
        return new VegetablePrice(vegetableTypeName, growState, Math.ceil(price)); 
    }

    vegetablePrizeFactor(vegetableTypeName) {
        let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

        return {
            satietyAlertLevel: vegetableSettings.satiety.alertLevel1,
            fertilizerPrice: this.settings.wallet.fertilizerPrice,
            immunityAlertLevel: vegetableSettings.immunity.alertLevel1,
            sprayerPrice: this.settings.wallet.sprayerPrice,
            seedsPrice: this.settings.wallet.seedsPrice,
            priceCoff: vegetableSettings.price.coff,
            intervalsInSeconds: structuredClone(vegetableSettings.growTimer.intervalsInSeconds)
        };
    }

    vegetableMeta(randomNumber) {
        for(let value of Object.values(this.settings)) {
            if(value.seedProbability && 
                randomNumber >= value.seedProbability.min &&
                randomNumber < value.seedProbability.max) {
                return new VegetableMeta(value.meta.typeName);
            }
        }
        throw new FailToCreateVegetableMeta(`There are not vegetables for randomNumber: ${randomNumber}`);
    }

    vegetableState(vegetableTypeName) {
        let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

        return VegetableState.of(
            StateDetail.of(
                vegetableSettings.vegetableState.seedDetail.intervalInSecond,
                lifeCycleStates.findByName(vegetableSettings.vegetableState.seedDetail.lifeCyleState)
            ),
            StateDetail.of(
                vegetableSettings.vegetableState.sproutDetail.intervalInSecond,
                lifeCycleStates.findByName(vegetableSettings.vegetableState.sproutDetail.lifeCyleState)
            ),
            StateDetail.of(
                vegetableSettings.vegetableState.chidlDetail.intervalInSecond,
                lifeCycleStates.findByName(vegetableSettings.vegetableState.chidlDetail.lifeCyleState)
            ),
            StateDetail.of(
                vegetableSettings.vegetableState.youthDetail.intervalInSecond,
                lifeCycleStates.findByName(vegetableSettings.vegetableState.youthDetail.lifeCyleState)
            )
        );
    }


    setSettings(settings) {
        this.settings = settings;
    }

    getSettings() {
        return this.settings;
    }


    #getSettingsByVegetableType(vegetableTypeName) {
        let vegetableSettings = null;

        if(vegetableTypeName == 'Potato') vegetableSettings = this.settings.potato;
        else if(vegetableTypeName == 'Tomato') vegetableSettings = this.settings.tomato;
        else throw new UnknownVegetableType(`Uknown vegetable type ${vegetableTypeName}`);

        return vegetableSettings;
    }

};