const {lifeCycleStates} = require('../../../src/code/model/logic/vegetableState.js');
const {ShovelSystem} = require('../../../src/code/model/logic/shovel.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {Fabric} = require('../../../src/code/model/logic/fabric.js');
const {Wallet} = require('../../../src/code/model/logic/wallet.js');
const {Grid} = require('../../../src/code/model/logic/store/grid.js');
const {SystemHandler} = require('../../../src/code/model/gameEngine/systemManager.js');

let fabric = null;
let manager = null;
let eventManager = null;
let wallet = null;
let worldMock = null;
let grid = null;
function beforeEachTest() {
    fabric = new Fabric({
        potato: {
            satiety: {
                alarmLevel1: 30
            },
            immunity: {
                alarmLevel1: 30
            },
            price: {
                coff: 1.5
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
            sum: 10,
            fertilizerPrice: 2,
            sprayerPrice: 2,
            seedsPrice: 3
        }
    });
    eventManager = new EventManager();
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    wallet = manager.createEntity().put(fabric.wallet());
    grid = new Grid(4, 3);
    manager.putSingletonEntity('wallet', wallet);
    manager.putSingletonEntity('fabric', fabric);
    manager.putSingletonEntity('grid', grid);

    worldMock = {
        getEntityComponentManager: () => manager,
        getEventManager: () => eventManager
    };
};
beforeEach(beforeEachTest);

function createAndPrepareVegetable(cellX, cellY, currentState, previousState) {
    let stateComp = fabric.vegetableState('Potato');
    stateComp.pushState(previousState);
    stateComp.pushState(currentState);
    let vegetable = manager.createEntity().put(
        new VegetableMeta('Potato'), 
        new GardenBedCellLink(cellX, cellY),
        stateComp
    );
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
            currentState: lifeCycleStates.death,
            previousState: lifeCycleStates.adult
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
            currentState: lifeCycleStates.death,
            previousState: lifeCycleStates.youth
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
            currentState: lifeCycleStates.death,
            previousState: lifeCycleStates.child
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
            currentState: lifeCycleStates.death,
            previousState: lifeCycleStates.adult
        },
        event: {tool: 'shovel', cellX: 1, cellY: 1},
        money: 10, 
        expectedMoney: 10,
        expectedCellState: { cellX: 3, cellY: 2, isEmpty: false, isAlive: true}
    },
    {
        vegetableParams: {
            cellX: 3,
            cellY: 2,
            currentState: lifeCycleStates.death,
            previousState: lifeCycleStates.sprout
        },
        event: {tool: 'shovel', cellX: 3, cellY: 2},
        money: 10, 
        expectedMoney: 10,
        expectedCellState: { cellX: 3, cellY: 2, isEmpty: true, isAlive: false}
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
            currentState: lifeCycleStates.sleepingSeed,
            previousState: null
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
            currentState: lifeCycleStates.seed,
            previousState: lifeCycleStates.sleepingSeed
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
            currentState: lifeCycleStates.sprout,
            previousState: lifeCycleStates.seed
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
            currentState: lifeCycleStates.child,
            previousState: lifeCycleStates.sprout
        },
        event: {tool: 'shovel', cellX: 2, cellY: 1},
        money: 10, 
        expectedMoney: 24,
        expectedCellState: { cellX: 2, cellY: 1, isEmpty: true, isAlive: false}
    },
    {
        vegetableParams: {
            cellX: 2,
            cellY: 1,
            currentState: lifeCycleStates.youth,
            previousState: lifeCycleStates.child
        },
        event: {tool: 'shovel', cellX: 2, cellY: 1},
        money: 10, 
        expectedMoney: 32,
        expectedCellState: { cellX: 2, cellY: 1, isEmpty: true, isAlive: false}
    },
    {
        vegetableParams: {
            cellX: 2,
            cellY: 1,
            currentState: lifeCycleStates.adult,
            previousState: lifeCycleStates.youth
        },
        event: {tool: 'shovel', cellX: 2, cellY: 1},
        money: 10, 
        expectedMoney: 40,
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
                    vegetableParams.currentState, 
                    vegetableParams.previousState
                ) : null;
            if(event) eventManager.writeEvent(event.tool, event);
            wallet.get(Wallet).sum = money;

            let system = new ShovelSystem(manager);
            system.update(systemHandler(system), worldMock);

            expect(wallet.get(Wallet).sum).toEqual(expectedMoney);
            expect(grid.get(expectedCellState.cellX, expectedCellState.cellY) == null).toBe(expectedCellState.isEmpty);
            if(vegetable) expect(manager.isAlive(vegetable)).toBe(expectedCellState.isAlive);
        });
    }
);
