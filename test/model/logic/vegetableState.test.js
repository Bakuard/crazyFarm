const {VegetableState, GrowSystem, lifeCycleStates, StateDetail} = require('../../../src/code/model/logic/vegetableState.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {Grid} = require('../../../src/code/model/logic/store/grid.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {SystemHandler} = require('../../../src/code/model/gameEngine/systemManager.js');

let manager = null;
let eventManager = null;
let worldMock = null;
let grid = null;
function beforeEachSetting() {
    eventManager = new EventManager();
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    grid = new Grid(4, 3);
    manager.putSingletonEntity('grid', grid);
    
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
    result.pushState(currentState);

    return result;
}

function createAndPrepareSleepingSeed(cellX, cellY, typeName, intervalsInSeconds) {
    let vegetable = manager.createEntity().put(
        new VegetableMeta(typeName),
        new GardenBedCellLink(cellX, cellY),
        vegetableState(lifeCycleStates.sleepingSeed, intervalsInSeconds)
    );
    manager.bindEntity(vegetable);
    grid.write(cellX, cellY, vegetable);
    return vegetable;
}

function systemHandler(system) {
    return new SystemHandler('GrowSystem', 'update', system, 0, 1);
}

describe.each([
    {
        sleepingSeedParam: {cellX: 3, cellY: 2},
        event: {tool: 'bailer', cellX: 3, cellY: 2},
        elapsedTime: 2999, 
        intervalsInSeconds: [3, 40, 40, 40],
        expectedVegetableState: {cellX: 3, cellY: 2, hasGrowComps: true, nextState: lifeCycleStates.seed}
    },
    {
        sleepingSeedParam: {cellX: 3, cellY: 2},
        event: {tool: 'bailer', cellX: 3, cellY: 2},
        elapsedTime: 3000, 
        intervalsInSeconds: [3, 40, 40, 40],
        expectedVegetableState: {cellX: 3, cellY: 2, hasGrowComps: true, nextState: lifeCycleStates.sprout}
    },
    {
        sleepingSeedParam: {cellX: 3, cellY: 2},
        event: {tool: 'bailer', cellX: 3, cellY: 2},
        elapsedTime: 43000, 
        intervalsInSeconds: [3, 40, 40, 40],
        expectedVegetableState: {cellX: 3, cellY: 2, hasGrowComps: true, nextState: lifeCycleStates.child}
    },
    {
        sleepingSeedParam: {cellX: 3, cellY: 2},
        event: {tool: 'bailer', cellX: 3, cellY: 2},
        elapsedTime: 83000, 
        intervalsInSeconds: [3, 40, 40, 40],
        expectedVegetableState: {cellX: 3, cellY: 2, hasGrowComps: true, nextState: lifeCycleStates.youth}
    },
    {
        sleepingSeedParam: {cellX: 3, cellY: 2},
        event: {tool: 'bailer', cellX: 3, cellY: 2},
        elapsedTime: 123000, 
        intervalsInSeconds: [3, 40, 40, 40],
        expectedVegetableState: {cellX: 3, cellY: 2, hasGrowComps: true, nextState: lifeCycleStates.adult}
    },

    {
        sleepingSeedParam: {cellX: 3, cellY: 2},
        event: null,
        elapsedTime: 1000000, 
        intervalsInSeconds: [3, 40, 40, 40],
        expectedVegetableState: {cellX: 3, cellY: 2, hasGrowComps: false, nextState: lifeCycleStates.sleepingSeed}
    },
    {
        sleepingSeedParam: {cellX: 3, cellY: 2},
        event: {tool: 'bailer', cellX: 0, cellY: 1},
        elapsedTime: 1000000, 
        intervalsInSeconds: [3, 40, 40, 40],
        expectedVegetableState: {cellX: 3, cellY: 2, hasGrowComps: false, nextState: lifeCycleStates.sleepingSeed}
    }
])(`update(groupName, world): vegetables currentState is 'sleepigSeed'`,
    ({sleepingSeedParam, event, elapsedTime, intervalsInSeconds, expectedVegetableState}) => {
        beforeEach(beforeEachSetting);

        test(`sleepingSeedParam ${JSON.stringify(sleepingSeedParam)},
              event ${JSON.stringify(event)},
              elapsedTime ${elapsedTime},
              intervalsInSeconds [${intervalsInSeconds}]
              => expectedVegetableState ${JSON.stringify(expectedVegetableState)}`,
        () => {
            let vegetable = createAndPrepareSleepingSeed(sleepingSeedParam.cellX, sleepingSeedParam.cellY, 'Potato', intervalsInSeconds);
            if(event) eventManager.writeEvent(event.tool, event);
            worldMock.elapsedTime = elapsedTime;

            let system = new GrowSystem(
                manager, 
                () => new Thirst(60, 60, 1, 30), 
                () => new Satiety(60, 60, 1, 30), 
                () => new Immunity(60, 60, false, 1, 0.5, 30)
            );
            system.update(systemHandler(system), worldMock);

            expect(vegetable.get(VegetableState).current()).toBe(expectedVegetableState.nextState);
            expect(vegetable.hasComponents(Immunity)).toBe(expectedVegetableState.hasGrowComps);
            expect(vegetable.hasComponents(Satiety)).toBe(expectedVegetableState.hasGrowComps);
            expect(vegetable.hasComponents(Thirst)).toBe(expectedVegetableState.hasGrowComps);
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
    
            let system = new GrowSystem(
                manager, 
                () => new Thirst(60, 60, 1, 30), 
                () => new Satiety(60, 60, 1, 30), 
                () => new Immunity(60, 60, false, 1, 0.5, 30)
            );
            system.update(systemHandler(system), worldMock);
    
            expect(entity.get(VegetableState).current()).toBe(nextState);
        });
    }
);
