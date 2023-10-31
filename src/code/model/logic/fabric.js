'use strict'

const {PotatoGhost} = require('./potatoDeath.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {UnknownVegetableType, FailToCreateVegetableMeta} = require('../exception/exceptions.js');
const {Wallet} = require('./wallet.js');
const {VegetableMeta} = require('./vegetableMeta.js');
const {VegetableState, StateDetail, lifeCycleStates} = require('./vegetableState.js');
const {Grid} = require('./store/grid.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {TomatoExplosion} = require('./tomatoDeath.js');
const {TimeUtil} = require('../gameEngine/timeUtil.js');

const defaultSettings = {
    potato: {
        ghost: {
            timeInMillis: 10000
        },
        immunity: {
            max: 80,
            alertLevel1: 40,
            declineRatePerSeconds: 1,
            probability: 0.05
        },
        satiety: {
            max: 80,
            alertLevel1: 40,
            declineRatePerSeconds: 1
        },
        thirst: {
            max: 80,
            alertLevel1: 40,
            declineRatePerSeconds: 1
        },
        price: {
            coff: 1.5
        },
        seedProbability: {
            min: 0,
            max: 0.7
        },
        meta: {
            typeName: 'Potato'
        },
        vegetableState: {
            seedDetail: {
                intervalInSecond: 1,
                lifeCyleState: 'seed'
            },
            sproutDetail: {
                intervalInSecond: 90,
                lifeCyleState: 'sprout'
            },
            chidlDetail: {
                intervalInSecond: 90,
                lifeCyleState: 'child'
            },
            youthDetail: {
                intervalInSecond: 90,
                lifeCyleState: 'youth'
            }
        }
    },
    tomato: {
        explosion: {
            neighboursNumber: {
                child: 1,
                youth: 3,
                adult: 6
            },
            timeInMillis: 1001
        },
        immunity: {
            max: 80,
            alertLevel1: 40,
            declineRatePerSeconds: 1,
            probability: 0.05
        },
        satiety: {
            max: 80,
            alertLevel1: 40,
            declineRatePerSeconds: 1
        },
        thirst: {
            max: 80,
            alertLevel1: 40,
            declineRatePerSeconds: 1
        },
        price: {
            coff: 2
        },
        seedProbability: {
            min: 0.7,
            max: 1
        },
        meta: {
            typeName: 'Tomato'
        },
        vegetableState: {
            seedDetail: {
                intervalInSecond: 1,
                lifeCyleState: 'seed'
            },
            sproutDetail: {
                intervalInSecond: 90,
                lifeCyleState: 'sprout'
            },
            chidlDetail: {
                intervalInSecond: 90,
                lifeCyleState: 'child'
            },
            youthDetail: {
                intervalInSecond: 90,
                lifeCyleState: 'youth'
            }
        }
    },
    wallet: {
        sum: 1000,
        fertilizerPrice: 2,
        sprayerPrice: 2,
        seedsPrice: 3
    },
    grid: {
        width: 4,
        height: 3
    },
    gameLoop: {
        frameDurationInMillis: 1000
    }
};
module.exports.defaultSettings = defaultSettings;

module.exports.Fabric = class Fabric {

    static createWithDefaultSettings() {
        return new Fabric(defaultSettings);
    }

    constructor(settings) {
        this.settings = settings ?? defaultSettings;

        this.loadedComponents = {};
        this.loadedComponents['GardenBedCellLink'] = props => new GardenBedCellLink(
            props.cellX, 
            props.cellY
        );
        this.loadedComponents['Immunity'] = props => new Immunity(
            props.max, 
            props.current, 
            props.isSick, 
            props.declineRatePerSeconds, 
            props.probability
        );
        this.loadedComponents['PotatoGhost'] = props => new PotatoGhost(props.timeInMillis);
        this.loadedComponents['Satiety'] = props => new Satiety(props.max, props.current, props.declineRatePerSeconds);
        this.loadedComponents['Thirst'] = props => new Thirst(props.max, props.current, props.declineRatePerSeconds);
        this.loadedComponents['VegetableMeta'] = props => new VegetableMeta(props.typeName);
        this.loadedComponents['VegetableState'] = props => new VegetableState(
            props.history.map(state => lifeCycleStates.findByName(state.name)),
            props.stateDetails.map(state => 
                new StateDetail(state.currentTimeInMillis, 
                                state.intervalInSecond, 
                                lifeCycleStates.findByName(state.lifeCycleState.name))
            )
        );
        this.loadedComponents['TomatoExplosion'] = props => new TomatoExplosion(props.neighboursNumber);
        this.loadedComponents['Wallet'] = props => new Wallet(props.sum, props.fertilizerPrice, props.sprayerPrice, props.seedsPrice);
    }

    restoreComponentBy(compName, props) {
        return this.loadedComponents[compName](props);
    }

    potatoGhost() {
        return new PotatoGhost(this.settings.potato.ghost.timeInMillis);
    }

    tomatoExplosion(lifeCycleState) {
        let explosionSettings = this.settings.tomato.explosion;
        
        let tomatoExplosion = null;
        if(lifeCycleState == lifeCycleStates.child) tomatoExplosion = new TomatoExplosion(explosionSettings.neighboursNumber.child);
        else if(lifeCycleState == lifeCycleStates.youth) tomatoExplosion = new TomatoExplosion(explosionSettings.neighboursNumber.youth);
        else if(lifeCycleState == lifeCycleStates.adult) tomatoExplosion = new TomatoExplosion(explosionSettings.neighboursNumber.adult);
        tomatoExplosion.timeInMillis = explosionSettings.timeInMillis;

        return tomatoExplosion;
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

    vegetablePrizeFactor(vegetableTypeName) {
        let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

        return {
            satietyAlertLevel: vegetableSettings.satiety.alertLevel1,
            fertilizerPrice: this.settings.wallet.fertilizerPrice,
            immunityAlertLevel: vegetableSettings.immunity.alertLevel1,
            sprayerPrice: this.settings.wallet.sprayerPrice,
            seedsPrice: this.settings.wallet.seedsPrice,
            priceCoff: vegetableSettings.price.coff,
            growIntervals: [
                vegetableSettings.vegetableState.seedDetail.intervalInSecond,
                vegetableSettings.vegetableState.sproutDetail.intervalInSecond,
                vegetableSettings.vegetableState.chidlDetail.intervalInSecond,
                vegetableSettings.vegetableState.youthDetail.intervalInSecond
            ]
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

    grid() {
        return new Grid(
            this.settings.grid.width,
            this.settings.grid.height
        );
    }

    timeUtil() {
        if(!this.timeUtilObj) this.timeUtilObj = new TimeUtil();
        return this.timeUtilObj;
    }

    frameDurationInMillis() {
        return this.settings.gameLoop.frameDurationInMillis;
    }

    randomGenerator() {
        return Math.random;
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