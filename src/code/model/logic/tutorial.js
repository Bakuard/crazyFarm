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

    constructor(user, 
                userRepository, 
                activeCell,
                plantNewVegetableSystemTutorialFabric,
                growSystemTutorialFabric) {
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

        systemManager.putSystem('PlantNewVegetableSystemTutorial', this.plantNewVegetableSystemTutorialFabric()).
            putSystem('GrowSystemTutorial', this.growSystemTutorialFabric()).
            putSystem('TutorialEventFilter', new TutorialEventFilter(this.activeCell));

        systemManager.resetGroup(groups.update, 
            'GameCommandSystem', 
            'TutorialEventFilter', //<---- 
            'PlantNewVegetableSystemTutorial', //<----
            'TutorialSystem', //<----
            'ClearEventsSystem',
            'WorldLoggerSystem',
            'OutputSystem');

        manager.putSingletonEntity('tutorialCurrentStep', {step: 1, isActive: true, blockedTools: ['bailer', 'shovel', 'fertilizer', 'sprayer']});
        this.currentStep = this.step1;
    }

    step1(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();
        const grid = manager.getSingletonEntity('grid');

        if(grid.get(this.activeCell.x, this.activeCell.y)) {
            systemManager.resetGroup(groups.update, 
                'GameCommandSystem', 
                'TutorialEventFilter', //<----
                'GrowSystemTutorial', //<----
                'TutorialSystem', //<----
                'ClearEventsSystem',
                'WorldLoggerSystem',
                'OutputSystem');
            manager.putSingletonEntity('tutorialCurrentStep', {step: 2, isActive: true, blockedTools: ['seeds', 'shovel', 'fertilizer', 'sprayer']});
            this.currentStep = this.step2;
        }
    }

    step2(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();

        for(let vegetable of manager.select(manager.createFilter().all(VegetableState))) {
            const state = vegetable.get(VegetableState);
            if(state.current() == lifeCycleStates.sprout) {
                systemManager.resetGroup(groups.update, 
                    'GameCommandSystem', 
                    'TutorialEventFilter', //<----
                    'ThirstSystem', //<----
                    'TutorialSystem', //<----
                    'ClearEventsSystem',
                    'WorldLoggerSystem',
                    'OutputSystem');
                manager.putSingletonEntity('tutorialCurrentStep', {step: 3, isActive: true, blockedTools: ['seeds', 'shovel', 'fertilizer', 'sprayer']});
                this.currentStep = this.step3;
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
                systemManager.resetGroup(groups.update, 
                    'GameCommandSystem', 
                    'TutorialEventFilter', //<----
                    'GrowSystemTutorial', //<----
                    'TutorialSystem', //<----
                    'ClearEventsSystem',
                    'WorldLoggerSystem',
                    'OutputSystem');
                manager.putSingletonEntity('tutorialCurrentStep', {step: 4, isActive: true, blockedTools: ['bailer', 'shovel', 'seeds']});
                this.currentStep = this.step4GrowToChild;
            }
        }
    }

    step4GrowToChild(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();
        
        for(let vegetable of manager.select(manager.createFilter().all(VegetableState))) {
            const state = vegetable.get(VegetableState);
            if(state.current() == lifeCycleStates.child) {
                systemManager.removeSystem('GrowSystem').
                    putSystem('SatietySystem', this.satietySystemFabric()).
                    insertIntoGroup('SatietySystem', groups.update, 2).
                    putSystem('ImmunitySystem', this.immunitySystemFabric()).
                    insertIntoGroup('ImmunitySystem', groups.update, 3);
                this.currentStep = this.step4SatietyAndThirst;
            }
        }
    }

    step4SatietyAndThirst(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();
        const eventManager = world.getEventManager();

        for(let vegetable of manager.select(manager.createFilter().all(Satiety, Immunity))) {
            const satiety = vegetable.get(Satiety);
            const immunity = vegetable.get(Immunity);
            if(satiety.isAlarm()) this.step4Condition = 1;
            if(this.step4Condition === 1 && !satiety.isAlarm()) {
                this.step4Condition = 2;
                systemManager.removeSystem('SatietySystem');
            }
            if(immunity.isAlarm()) this.step4Condition2 = 1;
            if(this.step4Condition2 === 1 && !immunity.isAlarm()) {
                this.step4Condition2 = 2;
                systemManager.removeSystem('ImmunitySystem');
            }
            if(this.step4Condition === 2 && this.step4Condition2 === 2) {
                systemManager.putSystem('GrowSystem', this.growSystemTutorialFabric()).
                                insertIntoGroup('GrowSystem', groups.update, 2);
                manager.putSingletonEntity('tutorialCurrentStep', {step: 5, isActive: true, blockedTools: ['shovel']});
                this.currentStep = this.step5GrowToYouth;
            }
        }
    }

    step5GrowToYouth(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();
        
        for(let vegetable of manager.select(manager.createFilter().all(VegetableState))) {
            const state = vegetable.get(VegetableState);
            if(state.current() == lifeCycleStates.youth) {
                systemManager.removeSystem('GrowSystem').
                    putSystem('SatietySystem', this.satietySystemFabric()).
                    insertIntoGroup('SatietySystem', groups.update, 2).
                    putSystem('ImmunitySystem', this.immunitySystemFabric()).
                    insertIntoGroup('ImmunitySystem', groups.update, 3).
                    putSystem('ThirstSystem', this.thirstSystemFabric()).
                    insertIntoGroup('ThirstSystem', groups.update, 4);
                this.currentStep = step5SatietyAndThirstAndImmunity;
            }
        }
    }

    step5SatietyAndThirstAndImmunity(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();
        const eventManager = world.getEventManager();

        for(let vegetable of manager.select(manager.createFilter().all(Satiety, Immunity, Thirst))) {
            const satiety = vegetable.get(Satiety);
            const immunity = vegetable.get(Immunity);
            const thirst = vegetable.get(Thirst);
            if(satiety.isAlarm()) this.step5Condition = 1;
            if(this.step5Condition === 1 && !satiety.isAlarm()) {
                this.step5Condition = 2;
                systemManager.removeSystem('SatietySystem');
            }
            if(immunity.isAlarm()) this.step5Condition2 = 1;
            if(this.step5Condition2 === 1 && !immunity.isAlarm()) {
                this.step5Condition2 = 2;
                systemManager.removeSystem('ImmunitySystem');
            }
            if(thirst.isAlarm()) this.step5Condition3 = 1;
            if(this.step5Condition3 === 1 && !thirst.isAlarm()) {
                this.step5Condition3 = 2;
                systemManager.removeSystem('ThirstSystem');
            }
            if(this.step5Condition === 2 && this.step5Condition2 === 2 && this.step5Condition3 === 2) {
                systemManager.putSystem('GrowSystem', this.growSystemTutorialFabric()).
                                insertIntoGroup('GrowSystem', groups.update, 2);
                manager.putSingletonEntity('tutorialCurrentStep', {step: 6, isActive: true, blockedTools: ['bailer', 'seeds', 'fertilizer', 'sprayer']});
                this.currentStep = this.step6GrowToAdult;
            }
        }
    }

    step6GrowToAdult(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();
        
        for(let vegetable of manager.select(manager.createFilter().all(VegetableState))) {
            const state = vegetable.get(VegetableState);
            if(state.current() == lifeCycleStates.adult) {
                systemManager.removeSystem('GrowSystem').
                    putSystem('ShovelSystem', this.shovelSystemFabric()).
                    insertIntoGroup('ShovelSystem', groups.update, 2)
                this.currentStep = step6DigUp;
            }
        }
    }

    step6DigUp(world) {
        const manager = world.getEntityComponentManager();
        const systemManager = world.getSystemManager();
        const grid = world.getEntityComponentManager().getSingletonEntity('grid');

        if(!grid.get(this.activeCell.x, this.activeCell.y)) {
            this.user.isTutorialFinished = true;
            this.userRepository.add(this.user).then(() => logger.info('userId=%s has completed tutorial.', this.user._id));
            
            systemManager.putSystem('PlantNewVegetableSystem', this.plantNewVegetableSystemFabric()).
                insertIntoGroup('PlantNewVegetableSystem', groups.update, 3).
                putSystem('GrowSystem', this.growSystemFabric()).insertIntoGroup('GrowSystem', groups.update, 4).
                putSystem('ThirstSystem', this.thirstSystemFabric()).insertIntoGroup('ThirstSystem', groups.update, 5).
                putSystem('SatietySystem', this.satietySystemFabric()).insertIntoGroup('SatietySystem', groups.update, 6).
                putSystem('ImmunitySystem', this.immunitySystemFabric()).insertIntoGroup('ImmunitySystem', groups.update, 7).
                putSystem('TomatoDeathSystem', this.tomatoDeathSystemFabric()).insertIntoGroup('TomatoDeathSystem', groups.update, 8).
                putSystem('PotatoDeathSystem', this.potatoDeathSystemFabric()).insertIntoGroup('PotatoDeathSystem', groups.update, 9).
                removeSystem('TutorialSystem').
                removeSystem('TutorialEventFilter');
            
            manager.putSingletonEntity('tutorialCurrentStep', {step: 6, isActive: false, blockedTools: []});
        }
    }
}
