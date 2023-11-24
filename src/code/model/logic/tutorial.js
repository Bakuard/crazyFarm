'use strict'

const {groups} = require('../gameEngine/gameLoop.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {VegetableState, lifeCycleStates} = require('./vegetableState.js');
const {newLogger} = require('../../conf/logConf.js');

const logger = newLogger('info', 'tutorial.js');

class TutorialEventFilter {
    constructor(activeCell) {
        this.activeCell = activeCell;
    }

    update(systemHandler, world) {
        const eventManager = world.getEventManager();

        const seedsEvent = eventManager.events('seeds').find(event => event.cellX == this.activeCell.x && event.cellY == this.activeCell.y);
        eventManager.clearEventQueue('seeds');
        if(seedsEvent) eventManager.writeEvent('seeds', seedsEvent);
    }
}

module.exports.TutorialSystem = class TutorialSystem {

    constructor(version,
                user, 
                userRepository, 
                activeCell,
                plantNewVegetableSystemTutorialFabric,
                growSystemTutorialFabric) {
        this.version = version;
        this.user = user;
        this.userRepository = userRepository;
        this.activeCell = activeCell;
        this.plantNewVegetableSystemTutorialFabric = plantNewVegetableSystemTutorialFabric;
        this.growSystemTutorialFabric = growSystemTutorialFabric;

        this.currentStep = this.init;
    }

    update(systemHandler, world) {
        this.currentStep(world);
    }

    init(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();
        const tutorialCurrentStep = manager.getSingletonEntity('tutorialCurrentStep');

        systemManager.putSystem('PlantNewVegetableSystemTutorial', this.plantNewVegetableSystemTutorialFabric()).
            putSystem('GrowSystemTutorial', this.growSystemTutorialFabric()).
            putSystem('TutorialEventFilter', new TutorialEventFilter(this.activeCell));

        if(tutorialCurrentStep) {
            this.#setStep(world, tutorialCurrentStep);
        } else {
            this.#setStep(
                world,
                {
                    step: 1, 
                    stepName: 'step1', 
                    isActive: true, 
                    blockedTools: ['bailer', 'shovel', 'fertilizer', 'sprayer'], 
                    activeCell: this.activeCell,
                    systemNames: [
                        'GameCommandSystem', 
                        'ResetGameSystem',
                        'TutorialEventFilter', //<---- 
                        'PlantNewVegetableSystemTutorial', //<----
                        'TutorialSystem', //<----
                        'WorldLoggerSystem',
                        'OutputSystem',
                        'ClearEventsSystem'
                    ],
                    version: this.version
                }
            );
        }
    }

    step1(world) {
        const manager = world.getEntityComponentManager();
        const grid = manager.getSingletonEntity('grid');

        if(grid.get(this.activeCell.x, this.activeCell.y)) {
            this.#setStep(
                world,
                {
                    step: 2, 
                    stepName: 'step2', 
                    isActive: true, 
                    blockedTools: ['seeds', 'shovel', 'fertilizer', 'sprayer'], 
                    activeCell: this.activeCell,
                    systemNames: [
                        'GameCommandSystem', 
                        'ResetGameSystem',
                        'TutorialEventFilter', //<----
                        'GrowSystemTutorial', //<----
                        'TutorialSystem', //<----
                        'WorldLoggerSystem',
                        'OutputSystem',
                        'ClearEventsSystem'
                    ],
                    version: this.version
                }
            );
        }
    }

    step2(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();
        const eventManager = world.getEventManager();

        for(let vegetable of manager.select(manager.createFilter().all(VegetableState))) {
            const state = vegetable.get(VegetableState);
            if(state.current() == lifeCycleStates.sprout) {
                this.#setStep(
                    world,
                    {
                        step: 3, 
                        stepName: 'step3', 
                        isActive: true, 
                        blockedTools: ['seeds', 'shovel', 'fertilizer', 'sprayer'], 
                        activeCell: this.activeCell,
                        systemNames: [
                            'GameCommandSystem', 
                            'ResetGameSystem',
                            'TutorialEventFilter', //<----
                            'ThirstSystem', //<----
                            'TutorialSystem', //<----
                            'WorldLoggerSystem',
                            'OutputSystem',
                            'ClearEventsSystem'
                        ],
                        version: this.version
                    }
                );
            }
        }
    }

    step3(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();
        const eventManager = world.getEventManager();

        for(let vegetable of manager.select(manager.createFilter().all(Thirst))) {
            const thirst = vegetable.get(Thirst);
            if(thirst.isAlarm()) this.step3Condition = 1;
            if(this.step3Condition === 1 && !thirst.isAlarm()) {
                this.#setStep(
                    world,
                    {
                        step: 3, 
                        stepName: 'step3GrowToChild', 
                        isActive: true, 
                        blockedTools: ['seeds', 'shovel', 'fertilizer', 'sprayer'], 
                        activeCell: this.activeCell,
                        systemNames: [
                            'GameCommandSystem', 
                            'ResetGameSystem',
                            'TutorialEventFilter', //<----
                            'GrowSystemTutorial', //<----
                            'TutorialSystem', //<----
                            'WorldLoggerSystem',
                            'OutputSystem',
                            'ClearEventsSystem'
                        ],
                        version: this.version
                    }
                );
            }
        }
    }

    step3GrowToChild(world) {
        const manager = world.getEntityComponentManager();
        
        for(let vegetable of manager.select(manager.createFilter().all(VegetableState))) {
            const state = vegetable.get(VegetableState);
            if(state.current() == lifeCycleStates.child) {
                this.#setStep(
                    world,
                    {
                        step: 4, 
                        stepName: 'step4SatietyAndThirst', 
                        isActive: true, 
                        blockedTools: ['bailer', 'shovel', 'seeds'], 
                        activeCell: this.activeCell,
                        systemNames: [
                            'GameCommandSystem', 
                            'ResetGameSystem',
                            'TutorialEventFilter', //<----
                            'SatietySystem', //<----
                            'ImmunitySystem', //<----
                            'TutorialSystem', //<----
                            'WorldLoggerSystem',
                            'OutputSystem',
                            'ClearEventsSystem'
                        ],
                        version: this.version
                    }
                );
            }
        }
    }

    step4SatietyAndThirst(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();

        for(let vegetable of manager.select(manager.createFilter().all(Satiety, Immunity))) {
            const satiety = vegetable.get(Satiety);
            const immunity = vegetable.get(Immunity);
            if(satiety.isAlarm()) this.step4Condition = 1;
            if(this.step4Condition === 1 && !satiety.isAlarm()) {
                this.step4Condition = 2;
                systemManager.removeFromGroup(groups.update, 'SatietySystem');
            }
            if(immunity.isAlarm()) this.step4Condition2 = 1;
            if(this.step4Condition2 === 1 && !immunity.isAlarm()) {
                this.step4Condition2 = 2;
                systemManager.removeFromGroup(groups.update, 'ImmunitySystem');
            }
            if(this.step4Condition === 2 && this.step4Condition2 === 2) {
                this.#setStep(
                    world,
                    {
                        step: 4, 
                        stepName: 'step4GrowToYouth', 
                        isActive: true, 
                        blockedTools: ['bailer', 'shovel', 'seeds'], 
                        activeCell: this.activeCell,
                        systemNames: [
                            'GameCommandSystem', 
                            'ResetGameSystem',
                            'TutorialEventFilter', //<----
                            'GrowSystemTutorial', //<----
                            'TutorialSystem', //<----
                            'WorldLoggerSystem',
                            'OutputSystem',
                            'ClearEventsSystem'
                        ],
                        version: this.version
                    }
                );
            }
        }
    }

    step4GrowToYouth(world) {
        const manager = world.getEntityComponentManager();
        
        for(let vegetable of manager.select(manager.createFilter().all(VegetableState))) {
            const state = vegetable.get(VegetableState);
            if(state.current() == lifeCycleStates.youth) {
                this.#setStep(
                    world,
                    {
                        step: 5, 
                        stepName: 'step5SatietyAndThirstAndImmunity',
                        isActive: true, 
                        blockedTools: ['shovel', 'seeds'],
                        activeCell: this.activeCell,
                        systemNames: [
                            'GameCommandSystem', 
                            'ResetGameSystem',
                            'TutorialEventFilter', //<----
                            'SatietySystem', //<----
                            'ImmunitySystem', //<----
                            'ThirstSystem', //<----
                            'TutorialSystem', //<----
                            'WorldLoggerSystem',
                            'OutputSystem',
                            'ClearEventsSystem'
                        ],
                        version: this.version
                    }
                );
            }
        }
    }

    step5SatietyAndThirstAndImmunity(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();

        for(let vegetable of manager.select(manager.createFilter().all(Satiety, Immunity, Thirst))) {
            const satiety = vegetable.get(Satiety);
            const immunity = vegetable.get(Immunity);
            const thirst = vegetable.get(Thirst);
            if(satiety.isAlarm()) this.step5Condition = 1;
            if(this.step5Condition === 1 && !satiety.isAlarm()) {
                this.step5Condition = 2;
                systemManager.removeFromGroup(groups.update, 'SatietySystem');
            }
            if(immunity.isAlarm()) this.step5Condition2 = 1;
            if(this.step5Condition2 === 1 && !immunity.isAlarm()) {
                this.step5Condition2 = 2;
                systemManager.removeFromGroup(groups.update, 'ImmunitySystem');
            }
            if(thirst.isAlarm()) this.step5Condition3 = 1;
            if(this.step5Condition3 === 1 && !thirst.isAlarm()) {
                this.step5Condition3 = 2;
                systemManager.removeFromGroup(groups.update, 'ThirstSystem');
            }
            if(this.step5Condition === 2 && this.step5Condition2 === 2 && this.step5Condition3 === 2) {
                this.#setStep(
                    world,
                    {
                        step: 5, 
                        stepName: 'step5GrowToAdult', 
                        isActive: true, 
                        blockedTools: ['shovel', 'seeds'],
                        activeCell: this.activeCell,
                        systemNames: [
                            'GameCommandSystem', 
                            'ResetGameSystem',
                            'TutorialEventFilter', //<----
                            'GrowSystemTutorial', //<----
                            'TutorialSystem', //<----
                            'WorldLoggerSystem',
                            'OutputSystem',
                            'ClearEventsSystem'
                        ],
                        version: this.version
                    }
                );
            }
        }
    }

    step5GrowToAdult(world) {
        const manager = world.getEntityComponentManager();
        
        for(let vegetable of manager.select(manager.createFilter().all(VegetableState))) {
            const state = vegetable.get(VegetableState);
            if(state.current() == lifeCycleStates.adult) {
                this.#setStep(
                    world,
                    {
                        step: 6, 
                        stepName: 'step6DigUp', 
                        isActive: true, 
                        blockedTools: ['bailer', 'seeds', 'fertilizer', 'sprayer'], 
                        activeCell: this.activeCell,
                        systemNames: [
                            'GameCommandSystem', 
                            'ResetGameSystem',
                            'TutorialEventFilter', //<----
                            'ShovelSystem', //<----
                            'TutorialSystem', //<----
                            'WorldLoggerSystem',
                            'OutputSystem',
                            'ClearEventsSystem'
                        ],
                        version: this.version
                    }
                );
            }
        }
    }

    step6DigUp(world) {
        const grid = world.getEntityComponentManager().getSingletonEntity('grid');

        if(!grid.get(this.activeCell.x, this.activeCell.y)) {
            this.user.isTutorialFinished = true;
            this.userRepository.update(this.user).then(() => logger.info('userId=%s has completed tutorial.', this.user._id));
            
            this.#setStep(
                world,
                {
                    step: 7, 
                    stepName: 'afterTutorial', 
                    isActive: true, 
                    blockedTools: [], 
                    activeCell: null,
                    systemNames: [
                        'TutorialSystem',
                        'GameCommandSystem', 
                        'ResetGameSystem',
                        'ShovelSystem',
                        'PlantNewVegetableSystem',
                        'GrowSystem',
                        'ThirstSystem',
                        'SatietySystem',
                        'OnionHealSystem',
                        'ImmunitySystem',
                        'TomatoDeathSystem',
                        'PotatoDeathSystem',
                        'OnionDeathSystem',
                        'WorldLoggerSystem',
                        'OutputSystem'
                    ],
                    version: this.version
                }
            );
        }
    }

    afterTutorial(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();

        manager.putSingletonEntity('tutorialCurrentStep', null);
        systemManager.removeFromGroup(groups.update, 'TutorialSystem');
    }


    #setStep(world, tutorialCurrentStep) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();
        const eventManager = world.getEventManager();

        systemManager.resetGroup(groups.update, ...tutorialCurrentStep.systemNames);
        
        manager.putSingletonEntity('tutorialCurrentStep', tutorialCurrentStep);
        eventManager.setFlag('gameStateWasChangedEvent');
        this.currentStep = Object.getPrototypeOf(this)[tutorialCurrentStep.stepName];
    }
}
