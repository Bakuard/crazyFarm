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
const {ClearEventsSystem} = require('./clearEvents.js');

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
            seedInterval: 1,
            sproutlInterval: 90,
            childInterval: 90,
            youthInterval: 90
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
            seedInterval: 1,
            sproutInterval: 90,
            childInterval: 90,
            youthInterval: 90
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
    },
    tutorial: {
        activeCell: {
            x: 1,
            y: 0
        },
        vegetable: {
            meta: {
                typeName: 'Potato'
            },
            immunity: {
                max: 4,
                alarmLevel1: 2,
                declineRatePerSeconds: 1,
                probability: 1
            },
            satiety: {
                max: 4,
                alarmLevel1: 2,
                declineRatePerSeconds: 1
            },
            thirst: {
                max: 4,
                alarmLevel1: 2,
                declineRatePerSeconds: 1
            },
            vegetableState: {
                seedInterval: 1,
                sproutInterval: 6,
                childInterval: 6,
                youthInterval: 6
            }
        }
    }
};
module.exports.defaultSettings = defaultSettings;

module.exports.Fabric = class Fabric {

    static createWithDefaultSettings() {
        return new Fabric(defaultSettings);
    }

    constructor(settings) {
        this.settings = settings ?? defaultSettings;
    }

    componentLoader() {
        if(!this.loadedComponents) {
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
        return (compName, props) => {
            return this.loadedComponents[compName](props);
        }
    }

    potatoGhost() {
        return () => {
            return new PotatoGhost(this.settings.potato.ghost.timeInMillis);
        }
    }

    tomatoExplosion() {
        return (lifeCycleState) => {
            let explosionSettings = this.settings.tomato.explosion;
            
            let tomatoExplosion = null;
            if(lifeCycleState == lifeCycleStates.child) tomatoExplosion = new TomatoExplosion(explosionSettings.neighboursNumber.child);
            else if(lifeCycleState == lifeCycleStates.youth) tomatoExplosion = new TomatoExplosion(explosionSettings.neighboursNumber.youth);
            else if(lifeCycleState == lifeCycleStates.adult) tomatoExplosion = new TomatoExplosion(explosionSettings.neighboursNumber.adult);
            tomatoExplosion.timeInMillis = explosionSettings.timeInMillis;

            return tomatoExplosion;
        }
    }

    thirst() {
        return (vegetableTypeName) => {
            let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

            return Thirst.of(
                vegetableSettings.thirst.max, 
                vegetableSettings.thirst.declineRatePerSeconds,
                vegetableSettings.thirst.alarmLevel1
            );
        }
    }

    satiety() {
        return (vegetableTypeName) => {
            let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

            return Satiety.of(
                vegetableSettings.satiety.max, 
                vegetableSettings.satiety.declineRatePerSeconds,
                vegetableSettings.satiety.alarmLevel1
            );
        }
    }

    immunity() {
        return (vegetableTypeName) => {
            let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

            return Immunity.of(
                vegetableSettings.immunity.max, 
                vegetableSettings.immunity.declineRatePerSeconds,
                vegetableSettings.immunity.probability,
                vegetableSettings.immunity.alarmLevel1
            );
        }
    }  

    wallet() {
        return () => {
            return new Wallet(
                this.settings.wallet.sum,
                this.settings.wallet.fertilizerPrice,
                this.settings.wallet.sprayerPrice,
                this.settings.wallet.seedsPrice
            );
        }
    }

    vegetablePrizeFactor() {
        return (vegetableTypeName) => {
            let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

            return {
                satietyAlarmLevel: vegetableSettings.satiety.alarmLevel1,
                fertilizerPrice: this.settings.wallet.fertilizerPrice,
                immunityAlarmtLevel: vegetableSettings.immunity.alarmLevel1,
                sprayerPrice: this.settings.wallet.sprayerPrice,
                seedsPrice: this.settings.wallet.seedsPrice,
                priceCoff: vegetableSettings.price.coff,
                growIntervals: [
                    vegetableSettings.vegetableState.seedInterval,
                    vegetableSettings.vegetableState.sproutInterval,
                    vegetableSettings.vegetableState.childInterval,
                    vegetableSettings.vegetableState.youthInterval
                ]
            };
        }
    }

    vegetableMeta() {
        return () => {
            const randomGenerator = this.randomGenerator();
            const randomNumber = randomGenerator();
            for(let value of Object.values(this.settings)) {
                if(value.seedProbability && 
                    randomNumber >= value.seedProbability.min &&
                    randomNumber < value.seedProbability.max) {
                    return new VegetableMeta(value.meta.typeName);
                }
            }
            throw new FailToCreateVegetableMeta(`There are not vegetables for randomNumber: ${randomNumber}`);
        }
    }

    vegetableState() {
        return (vegetableTypeName) => {
            let vegetableSettings = this.#getSettingsByVegetableType(vegetableTypeName);

            return VegetableState.of(
                StateDetail.of(vegetableSettings.vegetableState.seedInterval, lifeCycleStates.seed),
                StateDetail.of(vegetableSettings.vegetableState.sproutInterval, lifeCycleStates.sprout),
                StateDetail.of(vegetableSettings.vegetableState.childInterval, lifeCycleStates.child),
                StateDetail.of(vegetableSettings.vegetableState.youthInterval, lifeCycleStates.youth)
            );
        }
    }

    grid() {
        return () => new Grid(this.settings.grid.width, this.settings.grid.height);
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
        return () => this.worldObj;
    }

    initSystem() {
        return () => new InitSystem(this.grid(), this.wallet());
    }

    loadGameSystem() {
        return (userId) => new LoadGameSystem(userId, this.componentLoader());
    }

    gameCommandSystem() {
        return () => new GameCommandSystem();
    }

    shovelSystem() {
        return () => new ShovelSystem(this.vegetablePrizeFactor());
    }

    plantNewVegetableSystem() {
        return () => new PlantNewVegetableSystem(this.vegetableMeta(), this.vegetableState());
    }

    growSystem() {
        return () => new GrowSystem(this.world()().getEntityComponentManager(), this.thirst(), this.satiety(), this.immunity());
    }

    thirstSystem() {
        return () => new ThirstSystem(this.world()().getEntityComponentManager());
    }

    satietySystem() {
        return () => new SatietySystem(this.world()().getEntityComponentManager());
    }

    immunitySystem() {
        return () => new ImmunitySystem(this.world()().getEntityComponentManager(), this.randomGenerator());
    }

    tomatoDeathSystem() {
        return () => new TomatoDeathSystem(this.world()().getEntityComponentManager(), this.randomGenerator(), this.tomatoExplosion());
    }

    potatoDeathSystem() {
        return () => new PotatoDeathSystem(this.world()().getEntityComponentManager(), this.potatoGhost());
    }

    clearEventsSystem() {
        return () => new ClearEventsSystem();
    }

    worldLogger() {
        return (user) => new WorldLogger(this.world()().getEntityComponentManager(), user);
    }

    outputSystem() {
        return (outputCallback) => new OutputSystem(false, outputCallback);
    }

    saveGameSystem() {
        return (userId, gameRepository) => new SaveGameSystem(userId, gameRepository, this.timeUtil());
    }


    activeCell() {
        const cellSettings = this.settings.tutorial.activeCell;
        return {
            x: cellSettings.x,
            y: cellSettings.y
        };
    }

    plantNewVegetableSystemTutorial() {
        return () => new PlantNewVegetableSystem(
            () => new VegetableMeta(this.settings.tutorial.vegetable.meta.typeName), 
            () => {
                const states = this.settings.tutorial.vegetable.vegetableState;
                return VegetableState.of(
                    StateDetail.of(states.seedInterval, lifeCycleStates.seed),
                    StateDetail.of(states.sproutInterval, lifeCycleStates.sprout),
                    StateDetail.of(states.childInterval, lifeCycleStates.child),
                    StateDetail.of(states.youthInterval, lifeCycleStates.youth)
                );
            }
        );
    }
    
    growSystemTutorial() {
        return () => {
            const vs = this.settings.tutorial.vegetable;
            return new GrowSystem(
                this.world()().getEntityComponentManager(), 
                () => Thirst.of(vs.thirst.max, vs.thirst.declineRatePerSeconds, vs.thirst.alarmLevel1),
                () => Satiety.of(vs.satiety.max, vs.satiety.declineRatePerSeconds, vs.satiety.alarmLevel1), 
                () => Immunity.of(vs.immunity.max, vs.immunity.declineRatePerSeconds, vs.immunity.probability, vs.immunity.alarmLevel1)
            );
        }
    }

    tutorialSystem() {
        return (user, userRepository) => new TutorialSystem(
            user, 
            userRepository,
            this.activeCell(),
            this.plantNewVegetableSystemTutorial(),
            this.growSystemTutorial()
        );
    }


    #getSettingsByVegetableType(vegetableTypeName) {
        let vegetableSettings = null;

        if(vegetableTypeName == 'Potato') vegetableSettings = this.settings.potato;
        else if(vegetableTypeName == 'Tomato') vegetableSettings = this.settings.tomato;
        else throw new UnknownVegetableType(`Uknown vegetable type ${vegetableTypeName}`);

        return vegetableSettings;
    }

};