const {ShovelSystem} = require('../../../src/code/model/logic/shovel.js');
const {GardenBedCell} = require('../../../src/code/model/logic/gardenBedCell.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {Fabric} = require('../../../src/code/model/logic/fabric.js');
const {Wallet} = require('../../../src/code/model/logic/wallet.js');
const {lifeCycleStates} = require('../../../src/code/model/logic/vegetableState.js');

let fabric = null;
let manager = null;
let eventManager = null;
let wallet = null;
let worldMock = null;
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
    manager.putSingletonEntity('wallet', wallet);
    manager.putSingletonEntity('fabric', fabric);

    eventManager = new EventManager();

    worldMock = {
        getEntityComponentManager: () => manager,
        getEventManager: () => eventManager
    };
};
beforeEach(beforeEachTest);

test(`update(groupName, world):
        there are not 'shovel' events
        => doesn't change cell,
           doesn't add money`,
    () => {
        let entity = manager.createEntity();
        entity.put(GardenBedCell.of(0, 0));
        manager.bindEntity(entity);
        let expectEntity = entity.clone();

        let system = new ShovelSystem(manager);
        system.update('update', worldMock);

        expect(entity).toEqualEntity(expectEntity);
        expect(wallet.get(Wallet).sum).toEqual(10);
    });

test(`update(groupName, world):
        there is 'shovel' event,
        gardenBedCell is empty
        => doesn't change cell,
           doesn't add money`,
    () => {
        let entity = manager.createEntity();
        entity.put(GardenBedCell.of(0, 0));
        manager.bindEntity(entity);
        eventManager.writeEvent('shovel', {tool: 'shovel', cell: 'center'});
        let expectEntity = entity.clone();

        let system = new ShovelSystem(manager);
        system.update('update', worldMock);

        expect(entity).toEqualEntity(expectEntity);
        expect(wallet.get(Wallet).sum).toEqual(10);
    });

test(`update(groupName, world):
        there is 'shovel' event,
        gardenBedCell is not empty,
        vegetable state == 'death'
        => doesn't change cell,
           doesn't add money,
           isAlive(vegetable) must return true`,
    () => {
        let cell = manager.createEntity().put(GardenBedCell.of(0, 0));
        let vegetable = createVegetable(cell, lifeCycleStates.death);
        cell.get(GardenBedCell).entity = vegetable;
        manager.bindEntity(cell);
        manager.bindEntity(vegetable);
        eventManager.writeEvent('shovel', {tool: 'shovel', cell: 'center'});
        let expectEntity = cell.clone();

        let system = new ShovelSystem(manager);
        system.update('update', worldMock);

        expect(cell).toEqualEntity(expectEntity);
        expect(wallet.get(Wallet).sum).toEqual(10);
        expect(manager.isAlive(vegetable)).toBe(true);
    });

describe.each([
    {state: lifeCycleStates.sleepingSeed, money: 10},
    {state: lifeCycleStates.seed, money: 10},
    {state: lifeCycleStates.sprout, money: 10},
    {state: lifeCycleStates.child, money: 24},
    {state: lifeCycleStates.youth, money: 32},
    {state: lifeCycleStates.adult, money: 40}
])(`update(groupName, world): there is 'shovel' event, gardenBedCell is not empty`,
    ({state, money}) => {
        beforeEachTest();

        test(`vegetable state == '${state.name}'
                => remove vegetable,
                cell must be empty,
                add money = ${money},
                isAlive(vegetable) must return false`,
        () => {
            let cell = manager.createEntity().put(GardenBedCell.of(0, 0));
            let vegetable = createVegetable(cell, state);
            cell.get(GardenBedCell).entity = vegetable;
            manager.bindEntity(cell);
            manager.bindEntity(vegetable);
            eventManager.writeEvent('shovel', {tool: 'shovel', cell: 'center'});

            let system = new ShovelSystem(manager);
            system.update('update', worldMock);
            let vegetables = [...manager.select(manager.createFilter().all(VegetableMeta))];

            expect(vegetables.length).toBe(0);
            expect(cell.get(GardenBedCell).entity).toBeNull();
            expect(wallet.get(Wallet).sum).toBe(money);
            expect(manager.isAlive(vegetable)).toBe(false);
        });
    }
);

function createVegetable(cell, state) {
    let stateComp = fabric.vegetableState('Potato');
    stateComp.history.push(state);
    return manager.createEntity().put(
        new VegetableMeta('Potato'), 
        new GardenBedCellLink(cell),
        stateComp
    );
}