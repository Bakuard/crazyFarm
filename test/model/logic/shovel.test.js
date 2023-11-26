const {VegetableState, StateDetail, lifeCycleStates} = require('../../../src/code/model/logic/vegetableState.js');
const {ShovelSystem} = require('../../../src/code/model/logic/shovel.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {Wallet} = require('../../../src/code/model/logic/wallet.js');
const {Grid} = require('../../../src/code/model/logic/store/grid.js');
const {SystemHandler} = require('../../../src/code/model/gameEngine/systemManager.js');

let manager = null;
let eventManager = null;
let wallet = null;
let worldMock = null;
let grid = null;
function beforeEachTest() {
    eventManager = new EventManager();
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    wallet = manager.createEntity().put(new Wallet(200, 2, 2, 3));
    grid = new Grid(4, 3);
    manager.putSingletonEntity('wallet', wallet);
    manager.putSingletonEntity('grid', grid);

    worldMock = {
        getEntityComponentManager: () => manager,
        getEventManager: () => eventManager
    };
};
beforeEach(beforeEachTest);

function vegetablePrizeFactor() {
    return {
        satietyAlarmLevel: 30,
        fertilizerPrice: 2,
        immunityAlarmtLevel: 30,
        sprayerPrice: 2,
        seedsPrice: 3,
        priceCoff: 1.5,
        growIntervals: [3, 100, 100, 100]
    };
}

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

function createAndPrepareVegetable(cellX, cellY, state, canBeDigUp) {
    let vegetable = manager.createEntity().put(
        new VegetableMeta('Potato'), 
        new GardenBedCellLink(cellX, cellY),
        vegetableState(state, [3, 100, 100, 100])
    );
    if(!canBeDigUp) vegetable.addTags('impossibleToDigUp');
    grid.write(cellX, cellY, vegetable);
    manager.bindEntity(vegetable);
    return vegetable;
}

function systemHandler(system) {
    return new SystemHandler('ShovelSystem', 'update', system, 0, 1);
}

describe.each([
    {
        vegetableParams: {
            cellX: 3,
            cellY: 2,
            state: lifeCycleStates.death,
            canBeDigUp: false
        },
        event: null,
        money: 10, 
        expectedMoney: 10,
        expectedCellState: { cellX: 3, cellY: 2, isEmpty: false, isAlive: true}
    },
    {
        vegetableParams: {
            cellX: 3,
            cellY: 2,
            state: lifeCycleStates.death,
            canBeDigUp: false
        },
        event: {tool: 'shovel', cellX: 1, cellY: 1},
        money: 10, 
        expectedMoney: 10,
        expectedCellState: { cellX: 3, cellY: 2, isEmpty: false, isAlive: true}
    },
    {
        vegetableParams: null,
        event: {tool: 'shovel', cellX: 3, cellY: 2},
        money: 10, 
        expectedMoney: 10,
        expectedCellState: { cellX: 3, cellY: 2, isEmpty: true, isAlive: false}
    },
    {
        vegetableParams: null,
        event: null,
        money: 10, 
        expectedMoney: 10,
        expectedCellState: { cellX: 3, cellY: 2, isEmpty: true, isAlive: false}
    },
    {
        vegetableParams: {
            cellX: 2,
            cellY: 1,
            state: lifeCycleStates.sleepingSeed,
            canBeDigUp: true
        },
        event: {tool: 'shovel', cellX: 2, cellY: 1},
        money: 10, 
        expectedMoney: 10,
        expectedCellState: { cellX: 2, cellY: 1, isEmpty: true, isAlive: false}
    },
    {
        vegetableParams: {
            cellX: 2,
            cellY: 1,
            state: lifeCycleStates.seed,
            canBeDigUp: true
        },
        event: {tool: 'shovel', cellX: 2, cellY: 1},
        money: 10, 
        expectedMoney: 10,
        expectedCellState: { cellX: 2, cellY: 1, isEmpty: true, isAlive: false}
    },
    {
        vegetableParams: {
            cellX: 2,
            cellY: 1,
            state: lifeCycleStates.sprout,
            canBeDigUp: true
        },
        event: {tool: 'shovel', cellX: 2, cellY: 1},
        money: 10, 
        expectedMoney: 10,
        expectedCellState: { cellX: 2, cellY: 1, isEmpty: true, isAlive: false}
    },
    {
        vegetableParams: {
            cellX: 2,
            cellY: 1,
            state: lifeCycleStates.child,
            canBeDigUp: true
        },
        event: {tool: 'shovel', cellX: 2, cellY: 1},
        money: 10, 
        expectedMoney: 36,
        expectedCellState: { cellX: 2, cellY: 1, isEmpty: true, isAlive: false}
    },
    {
        vegetableParams: {
            cellX: 2,
            cellY: 1,
            state: lifeCycleStates.youth,
            canBeDigUp: true
        },
        event: {tool: 'shovel', cellX: 2, cellY: 1},
        money: 10, 
        expectedMoney: 56,
        expectedCellState: { cellX: 2, cellY: 1, isEmpty: true, isAlive: false}
    },
    {
        vegetableParams: {
            cellX: 2,
            cellY: 1,
            state: lifeCycleStates.adult,
            canBeDigUp: true
        },
        event: {tool: 'shovel', cellX: 2, cellY: 1},
        money: 10, 
        expectedMoney: 76,
        expectedCellState: { cellX: 2, cellY: 1, isEmpty: true, isAlive: false}
    }
])(`update(groupName, world):`,
    ({vegetableParams, event, money, expectedMoney, expectedCellState}) => {
        beforeEach(beforeEachTest);

        test(`vegetableParams ${JSON.stringify(vegetableParams)}, 
              event ${JSON.stringify(event)}, 
              money ${money}
              => expectedMoney ${expectedMoney},
                 expectedCellState ${JSON.stringify(expectedCellState)}`,
        () => {
            let vegetable = vegetableParams ? 
                createAndPrepareVegetable(
                    vegetableParams.cellX, 
                    vegetableParams.cellY, 
                    vegetableParams.state, 
                    vegetableParams.canBeDigUp
                ) : null;
            if(event) eventManager.writeEvent(event.tool, event);
            wallet.get(Wallet).sum = money;

            let system = new ShovelSystem(vegetablePrizeFactor);
            system.update(systemHandler(system), worldMock);

            expect(wallet.get(Wallet).sum).toEqual(expectedMoney);
            expect(grid.get(expectedCellState.cellX, expectedCellState.cellY) == null).toBe(expectedCellState.isEmpty);
            if(vegetable) expect(manager.isAlive(vegetable)).toBe(expectedCellState.isAlive);
        });
    }
);
