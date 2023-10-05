const {VegetableState, GrowSystem, lifeCycleStates, StateDetail} = require('../../../src/code/model/logic/vegetableState.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {Fabric} = require('../../../src/code/model/logic/fabric.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {Thirst} = require('../../../src/code/model/logic/thirst.js');

let fabric = null;
let manager = null;
let eventManager = null;
let worldMock = null;
function beforeEachSetting() {
    fabric = new Fabric({
        potato: {
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
            }
        }
    });
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    manager.putSingletonEntity('fabric', fabric);

    eventManager = new EventManager();
    
    worldMock = {
        elapsedTime: 1000000,
        getEntityComponentManager: () => manager,
        getEventManager: () => eventManager,
        getGameLoop: function() {
            const et = this.elapsedTime;
            return {
                getElapsedTime: () => et
            }
        },
    };
};
beforeEach(beforeEachSetting);

function vegetableState(currentState, intervalsInSeconds) {
    let result = VegetableState.of(
        StateDetail.of(intervalsInSeconds[0], lifeCycleStates.seed),
        StateDetail.of(intervalsInSeconds[1], lifeCycleStates.sprout),
        StateDetail.of(intervalsInSeconds[2], lifeCycleStates.child),
        StateDetail.of(intervalsInSeconds[3], lifeCycleStates.youth)
    );
    result.history.push(currentState);

    return result;
}

describe.each([
    {hasBailerEvent: true, hasGrowComps: true, nextState: lifeCycleStates.seed, elapsedTime: 2999, intervalsInSeconds: [3, 40, 40, 40]},
    {hasBailerEvent: true, hasGrowComps: true, nextState: lifeCycleStates.sprout, elapsedTime: 3000, intervalsInSeconds: [3, 40, 40, 40]},
    {hasBailerEvent: true, hasGrowComps: true, nextState: lifeCycleStates.child, elapsedTime: 43000, intervalsInSeconds: [3, 40, 40, 40]},
    {hasBailerEvent: true, hasGrowComps: true, nextState: lifeCycleStates.youth, elapsedTime: 83000, intervalsInSeconds: [3, 40, 40, 40]},
    {hasBailerEvent: true, hasGrowComps: true, nextState: lifeCycleStates.adult, elapsedTime: 123000, intervalsInSeconds: [3, 40, 40, 40]},

    {hasBailerEvent: false, hasGrowComps: false, nextState: lifeCycleStates.sleepingSeed, elapsedTime: 1000000, intervalsInSeconds: [3, 40, 40, 40]}
])(`update(groupName, world): vegetables currentState is 'sleepigSeed`,
    ({hasBailerEvent, hasGrowComps, nextState, elapsedTime, intervalsInSeconds}) => {
        beforeEach(beforeEachSetting);

        test(`hasBailerEvent ${hasBailerEvent},
              elapsedTime ${elapsedTime},
              intervalsInSeconds [${intervalsInSeconds}]
              => nextState'${nextState.name}',
                 hasGrowComps ${hasGrowComps}`,
        () => {
            let entity = manager.createEntity();
            entity.put(vegetableState(lifeCycleStates.sleepingSeed, intervalsInSeconds), new VegetableMeta('Potato'));
            manager.bindEntity(entity);
            if(hasBailerEvent) eventManager.writeEvent('bailer', {tool: 'bailer', cell: 'center'});
            worldMock.elapsedTime = elapsedTime;
    
            let system = new GrowSystem(manager);
            system.update('udpate', worldMock);
    
            expect(entity.get(VegetableState).current()).toBe(nextState);
            expect(entity.hasComponents(Immunity, Satiety, Thirst)).toBe(hasGrowComps);
        });
    }
);

describe.each([
    {currentState: lifeCycleStates.seed, nextState: lifeCycleStates.seed, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 2999},
    {currentState: lifeCycleStates.sprout, nextState: lifeCycleStates.sprout, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 39999},
    {currentState: lifeCycleStates.child, nextState: lifeCycleStates.child, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 39999},
    {currentState: lifeCycleStates.youth, nextState: lifeCycleStates.youth, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 39999},

    {currentState: lifeCycleStates.seed, nextState: lifeCycleStates.sprout, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 3000},
    {currentState: lifeCycleStates.sprout, nextState: lifeCycleStates.child, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 40000},
    {currentState: lifeCycleStates.child, nextState: lifeCycleStates.youth, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 40000},
    {currentState: lifeCycleStates.youth, nextState: lifeCycleStates.adult, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 40000},

    {currentState: lifeCycleStates.seed, nextState: lifeCycleStates.sprout, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 3001},
    {currentState: lifeCycleStates.sprout, nextState: lifeCycleStates.child, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 40001},
    {currentState: lifeCycleStates.child, nextState: lifeCycleStates.youth, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 40001},
    {currentState: lifeCycleStates.youth, nextState: lifeCycleStates.adult, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 40001},

    {currentState: lifeCycleStates.seed, nextState: lifeCycleStates.child, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 43000},
    {currentState: lifeCycleStates.sprout, nextState: lifeCycleStates.youth, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 80000},
    {currentState: lifeCycleStates.child, nextState: lifeCycleStates.adult, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 80000},
    {currentState: lifeCycleStates.youth, nextState: lifeCycleStates.adult, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 1000000},

    {currentState: lifeCycleStates.adult, nextState: lifeCycleStates.adult, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 1000000},
    {currentState: lifeCycleStates.death, nextState: lifeCycleStates.death, intervalsInSeconds: [3, 40, 40, 40], elapsedTime: 1000000}
])(`update(groupName, world):`,
    ({currentState, nextState, intervalsInSeconds, elapsedTime}) => {
        beforeEach(beforeEachSetting);

        test(`vegetables currentState is '${currentState.name}',
              intervalsInSeconds [${intervalsInSeconds}],
              currentState '${currentState.name}',
              elapsedTime ${elapsedTime}
              => nextState'${nextState.name}'`,
        () => {
            let entity = manager.createEntity();
            entity.put(vegetableState(currentState, intervalsInSeconds));
            manager.bindEntity(entity);
            worldMock.elapsedTime = elapsedTime;
    
            let system = new GrowSystem(manager);
            system.update('udpate', worldMock);
    
            expect(entity.get(VegetableState).current()).toBe(nextState);
        });
    }
);
