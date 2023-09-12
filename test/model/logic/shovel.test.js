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
                alertLevel1: 30
            },
            immunity: {
                alertLevel1: 30
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
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    wallet = manager.createEntity().put(fabric.wallet());
    grid = new Grid(4, 3);
    manager.putSingletonEntity('wallet', wallet);
    manager.putSingletonEntity('fabric', fabric);
    manager.putSingletonEntity('grid', grid);

    eventManager = new EventManager();

    worldMock = {
        getEntityComponentManager: () => manager,
        getEventManager: () => eventManager
    };
};
beforeEach(beforeEachTest);

describe.each([
    {cellIsEmpty: true, vegetableState: null, areThereShovelEvents: false, money: 10, expectedMoney: 10},
    {cellIsEmpty: true, vegetableState: null, areThereShovelEvents: true, money: 10, expectedMoney: 10},
    {cellIsEmpty: false, vegetableState: lifeCycleStates.death, areThereShovelEvents: true, money: 10, expectedMoney: 10}
])(`update(groupName, world): can't use a shovel`,
    ({cellIsEmpty, vegetableState, areThereShovelEvents, money, expectedMoney}) => {
        beforeEach(beforeEachTest);

        test(`cellIsEmpty ${cellIsEmpty}, 
              areThereShovelEvents ${areThereShovelEvents}, 
              money ${money}
              => expectedMoney ${expectedMoney}`,
        () => {
            let cellItem = cellIsEmpty ? null : createVegetable(0, 0, vegetableState);
            grid.write(0, 0, cellItem);
            if(areThereShovelEvents) eventManager.writeEvent('shovel', {tool: 'shovel', cellX: 0, cellY: 0});
            wallet.get(Wallet).sum = money;

            let system = new ShovelSystem(manager);
            system.update('update', worldMock);

            expect(money).toEqual(expectedMoney);
            expect(grid.get(0, 0)).toBe(cellItem);
        });
    }
);

describe.each([
    {state: lifeCycleStates.sleepingSeed, money: 10, expectedMoney: 10},
    {state: lifeCycleStates.seed, money: 10, expectedMoney: 10},
    {state: lifeCycleStates.sprout, money: 10, expectedMoney: 10},
    {state: lifeCycleStates.child, money: 10, expectedMoney: 24},
    {state: lifeCycleStates.youth, money: 10, expectedMoney: 32},
    {state: lifeCycleStates.adult, money: 10, expectedMoney: 40}
])(`update(groupName, world): there is 'shovel' event, gardenBedCell is not empty`,
    ({state, money, expectedMoney}) => {
        beforeEach(beforeEachTest);

        test(`vegetable state '${state.name}'
                money ${money}
                => remove vegetable,
                cell must be empty,
                wallet.sum = ${expectedMoney},
                isAlive(vegetable) must return false`,
        () => {
            let vegetable = createVegetable(0, 0, state);
            manager.bindEntity(vegetable);
            grid.write(0, 0, vegetable);
            eventManager.writeEvent('shovel', {tool: 'shovel', cellX: 0, cellY: 0});
            wallet.get(Wallet).sum = money;

            let system = new ShovelSystem(manager);
            system.update('update', worldMock);
            let vegetables = [...manager.select(manager.createFilter().all(VegetableMeta))];

            expect(vegetables.length).toBe(0);
            expect(grid.get(0, 0)).toBeNull();
            expect(wallet.get(Wallet).sum).toBe(expectedMoney);
            expect(manager.isAlive(vegetable)).toBe(false);
        });
    }
);

function createVegetable(cellX, cellY, state) {
    let stateComp = fabric.vegetableState('Potato');
    stateComp.history.push(state);
    return manager.createEntity().put(
        new VegetableMeta('Potato'), 
        new GardenBedCellLink(cellX, cellY),
        stateComp
    );
}