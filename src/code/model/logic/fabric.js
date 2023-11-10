'use strict'

const {PotatoGhost, PotatoDeathSystem} = require('./potatoDeath.js');
const {Thirst, ThirstSystem} = require('./thirst.js');
const {Satiety, SatietySystem} = require('./satiety.js');
const {Immunity, ImmunitySystem} = require('./immunity.js');
const {UnknownVegetableType, FailToCreateVegetableMeta} = require('../exception/exceptions.js');
const {Wallet} = require('./wallet.js');
const {VegetableMeta} = require('./vegetableMeta.js');
const {VegetableState, StateDetail, lifeCycleStates, GrowSystem} = require('./vegetableState.js');
const {Grid} = require('./store/grid.js');
const {GardenBedCellLink} = require('./gardenBedCellLink.js');
const {TomatoExplosion, TomatoDeathSystem} = require('./tomatoDeath.js');
const {TimeUtil} = require('../gameEngine/timeUtil.js');
const {World} = require('../gameEngine/world.js');
const {InitSystem} = require('./init.js');
const {LoadGameSystem} = require('./loadGame.js');
const {GameCommandSystem} = require('./gameCommand.js');
const {ShovelSystem} = require('./shovel.js');
const {PlantNewVegetableSystem} = require('./plantNewVegetable.js');
const {WorldLogger} = require('./worldLogger.js');
const {OutputSystem} = require('./output.js');
const {SaveGameSystem} = require('./saveGame.js');
const {TutorialSystem} = require('./tutorial.js');

const defaultSettings = {
    potato: {
        ghost: {
            timeInMillis: 10000
        },
        immunity: {
            max: 80,
            alarmLevel1: 40,
            declineRatePerSeconds: 1,
            probability: 0.005
        },
        satiety: {
            max: 80,
            alarmLevel1: 40,
            declineRatePerSeconds: 1
        },
        thirst: {
            max: 80,
            alarmLevel1: 40,
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
            alarmLevel1: 40,
            declineRatePerSeconds: 1,
            probability: 0.005
        },
        satiety: {
            max: 80,
            alarmLevel1: 40,
            declineRatePerSeconds: 1
        },
        thirst: {
            max: 80,
            alarmLevel1: 40,
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
        frameDurationInMillis: 100
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
            props.probability,
            props.alarmLevel
        );
        this.loadedComponents['PotatoGhost'] = props => new PotatoGhost(props.timeInMillis);
        this.loadedComponents['Satiety'] = props => new Satiety(props.max, props.current, props.declineRatePerSeconds, props.alarmLevel);
        this.loadedComponents['Thirst'] = props => new Thirst(props.max, props.current, props.declineRatePerSeconds, props.alarmLevel);
        this.loadedComponents['VegetableMeta'] = props => new VegetableMeta(props.typeName);
        this.loadedComponents['VegetableState'] = props => new VegetableState(
            props.history.map(state => lifeCycleStates.findByName(state.name)),
            props.stateDetails.map(state => 
                new StateDetail(state.currentTimeInMillis, 
                                state.intervalInSecond, 
                                lifeCycleStates.findByName(state.lifeCycleState.name))
            )
        );
        this.loadedComponents['TomatoExplosion'] = props => new TomatoExplosion(props.neighboursNumber, props.timeInMillis);
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
            vegetableSettings.thirst.declineRatePerSeconds,
            vegetableSettings.thirst.alarmLevel1
        );
    }

    satiety(vegetableTypeName) {
        let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

        return Satiety.of(
            vegetableSettings.satiety.max, 
            vegetableSettings.satiety.declineRatePerSeconds,
            vegetableSettings.satiety.alarmLevel1
        );
    }

    immunity(vegetableTypeName) {
        let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

        return Immunity.of(
            vegetableSettings.immunity.max, 
            vegetableSettings.immunity.declineRatePerSeconds,
            vegetableSettings.immunity.probability,
            vegetableSettings.immunity.alarmLevel1
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
            satietyAlarmLevel: vegetableSettings.satiety.alarmLevel1,
            fertilizerPrice: this.settings.wallet.fertilizerPrice,
            immunityAlarmtLevel: vegetableSettings.immunity.alarmLevel1,
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

    world() {
        if(!this.worldObj) {
            this.worldObj = new World(this.frameDurationInMillis(), this.timeUtil());
        }
        return this.worldObj;
    }

    initSystem() {
        return new InitSystem(this);
    }

    loadGameSystem(userId) {
        return new LoadGameSystem(userId);
    }

    gameCommandSystem() {
        return new GameCommandSystem();
    }

    shovelSystem() {
        return new ShovelSystem();
    }

    plantNewVegetableSystem() {
        return new PlantNewVegetableSystem(this.randomGenerator());
    }

    growSystem() {
        return new GrowSystem(this.world().getEntityComponentManager());
    }

    thirstSystem() {
        return new ThirstSystem(this.world().getEntityComponentManager());
    }

    satietySystem() {
        return new SatietySystem(this.world().getEntityComponentManager());
    }

    immunitySystem() {
        return new ImmunitySystem(this.world().getEntityComponentManager(), this.randomGenerator());
    }

    tomatoDeathSystem() {
        return new TomatoDeathSystem(this.world().getEntityComponentManager(), this.randomGenerator());
    }

    potatoDeathSystem() {
        return new PotatoDeathSystem(this.world().getEntityComponentManager());
    }

    tutorialSystem(user, userRepository) {
        return new TutorialSystem(user, userRepository);
    }

    worldLogger(userId) {
        return new WorldLogger(this.world().getEntityComponentManager(), userId);
    }

    outputSystem(outputCallback) {
        return new OutputSystem(false, outputCallback);
    }

    saveGameSystem(userId, gameRepository) {
        return new SaveGameSystem(userId, gameRepository, this.timeUtil());
    }


    #getSettingsByVegetableType(vegetableTypeName) {
        let vegetableSettings = null;

        if(vegetableTypeName == 'Potato') vegetableSettings = this.settings.potato;
        else if(vegetableTypeName == 'Tomato') vegetableSettings = this.settings.tomato;
        else throw new UnknownVegetableType(`Uknown vegetable type ${vegetableTypeName}`);

        return vegetableSettings;
    }

};