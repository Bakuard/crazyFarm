const {VegetableState, GrowSystem, lifeCycleStates} = require('../../../src/code/model/logic/vegetableState.js');
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
            },
            vegetableState: {
                seedDetail: {
                    intervalInSecond: 10,
                    lifeCyleState: 'seed'
                },
                sproutDetail: {
                    intervalInSecond: 10,
                    lifeCyleState: 'sprout'
                },
                chidlDetail: {
                    intervalInSecond: 10,
                    lifeCyleState: 'child'
                },
                youthDetail: {
                    intervalInSecond: 10,
                    lifeCyleState: 'youth'
                }
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

test(`update(groupName, world):
        vegetables state is 'sleepigSeed',
        there is not 'bailer' event
        => doesn't change state of VegetableState component`,
    () => {
        let entity = manager.createEntity();
        entity.put(fabric.vegetableState('Potato'));
        manager.bindEntity(entity);

        let system = new GrowSystem(manager);
        system.update('udpate', worldMock);

        expect(entity.get(VegetableState).history.at(-1)).toBe(lifeCycleStates.sleepingSeed);
    });

test(`update(groupName, world):
        vegetables state is 'sleepigSeed',
        there is 'bailer' event
        => change state of VegetableState component,
           add Immunity, Satiety and Thirst components to entity`,
    () => {
        let entity = manager.createEntity();
        entity.put(fabric.vegetableState('Potato')).put(new VegetableMeta('Potato'));
        manager.bindEntity(entity);
        eventManager.writeEvent('bailer', {tool: 'bailer', cell: 'center'});

        let system = new GrowSystem(manager);
        system.update('udpate', worldMock);

        expect(entity.get(VegetableState).history.at(-1)).toBe(lifeCycleStates.seed);
        expect(entity.hasComponents(Immunity, Satiety, Thirst)).toBe(true);
    });

describe.each([
    {state: lifeCycleStates.adult},
    {state: lifeCycleStates.death}
])(`update(groupName, world): state doesn't change over time`,
    ({state}) => {
        beforeEachSetting();

        test(`vegetables state is '${state.name}'
                => doesn't change state of VegetableState component`,
        () => {
            let entity = manager.createEntity();
            let vegetableState = fabric.vegetableState('Potato');
            vegetableState.history.push(state);
            entity.put(vegetableState);
            manager.bindEntity(entity);
    
            let system = new GrowSystem(manager);
            system.update('udpate', worldMock);
    
            expect(entity.get(VegetableState).history.at(-1)).toBe(state);
        });
    }
);

describe.each([
    {state: lifeCycleStates.seed},
    {state: lifeCycleStates.sprout},
    {state: lifeCycleStates.child},
    {state: lifeCycleStates.youth}
])(`update(groupName, world): not enough time to change state`,
    ({state}) => {
        beforeEachSetting();

        test(`vegetables state is '${state.name}',
              vegetableStateComp.currentTimeInMillis + elapsedTime < vegetableStateComp.intervalInSeconds
              => doesn't change state of VegetableState component`,
        () => {
            let entity = manager.createEntity();
            let vegetableState = fabric.vegetableState('Potato');
            vegetableState.history.push(state);
            entity.put(vegetableState);
            manager.bindEntity(entity);
            worldMock.elapsedTime = 9999;
    
            let system = new GrowSystem(manager);
            system.update('udpate', worldMock);
    
            expect(entity.get(VegetableState).history.at(-1)).toBe(state);
        });
    }
);

describe.each([
    {state: lifeCycleStates.seed, nextState: lifeCycleStates.sprout},
    {state: lifeCycleStates.sprout, nextState: lifeCycleStates.child},
    {state: lifeCycleStates.child, nextState: lifeCycleStates.youth},
    {state: lifeCycleStates.youth, nextState: lifeCycleStates.adult}
])(`update(groupName, world): enough time to change state`,
    ({state, nextState}) => {
        beforeEachSetting();

        test(`vegetables state is '${state.name}',
              vegetableStateComp.currentTimeInMillis + elapsedTime = vegetableStateComp.intervalInSeconds
              => change state '${state.name}' to '${nextState.name}'`,
        () => {
            let entity = manager.createEntity();
            let vegetableState = fabric.vegetableState('Potato');
            vegetableState.history.push(state);
            entity.put(vegetableState);
            manager.bindEntity(entity);
            worldMock.elapsedTime = 10000;
    
            let system = new GrowSystem(manager);
            system.update('udpate', worldMock);
    
            expect(entity.get(VegetableState).history.at(-1)).toBe(nextState);
        });
    }
);

describe.each([
    {state: lifeCycleStates.seed, nextState: lifeCycleStates.sprout},
    {state: lifeCycleStates.sprout, nextState: lifeCycleStates.child},
    {state: lifeCycleStates.child, nextState: lifeCycleStates.youth},
    {state: lifeCycleStates.youth, nextState: lifeCycleStates.adult}
])(`update(groupName, world): enough time to change state`,
    ({state, nextState}) => {
        beforeEachSetting();

        test(`vegetables state is '${state.name}',
              vegetableStateComp.currentTimeInMillis + elapsedTime > vegetableStateComp.intervalInSeconds
              => change state '${state.name}' to '${nextState.name}'`,
        () => {
            let entity = manager.createEntity();
            let vegetableState = fabric.vegetableState('Potato');
            vegetableState.history.push(state);
            entity.put(vegetableState);
            manager.bindEntity(entity);
            worldMock.elapsedTime = 10001;
    
            let system = new GrowSystem(manager);
            system.update('udpate', worldMock);
    
            expect(entity.get(VegetableState).history.at(-1)).toBe(nextState);
        });
    }
);