const {ShovelSystem} = require('../../../src/code/model/logic/shovel.js');
const {GardenBedCell} = require('../../../src/code/model/logic/gardenBedCell.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {Fabric} = require('../../../src/code/model/logic/fabric.js');
const {GrowTimer, growStates} = require('../../../src/code/model/logic/growTimer.js');
const {Wallet} = require('../../../src/code/model/logic/wallet.js');

let fabric = null;
let manager = null;
let eventManager = null;
let wallet = null;
beforeEach(() => {
    fabric = new Fabric({
        potato: {
            satiety: {
                alertLevel1: 10
            },
            immunity: {
                alertLevel1: 10
            },
            growTimer: {
                state: growStates.seed,
                intervalsInSeconds: [3, 40, 40, 40, 40]
            },
            price: {
                coff: 1.5
            }
        },
        wallet: {
            sum: 10,
            fertilizerPrice: 2,
            sprayerPrice: 2,
            seedsPrice: 7
        }
    });
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    eventManager = new EventManager();
    wallet = manager.createEntity().put(fabric.wallet());

    manager.putSingletonEntity('wallet', wallet);
    manager.putSingletonEntity('fabric', fabric);
});

test(`update(groupName, world):
        there are not 'shovel' events
        => do nothing`,
    () => {
        let entity = manager.createEntity();
        entity.put(GardenBedCell.of(0, 0));
        manager.bindEntity(entity);
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };
        let expectEntity = entity.clone();

        let system = new ShovelSystem(manager);
        system.update('update', worldMock);

        expect(entity).toEqualEntity(expectEntity);
    });

test(`update(groupName, world):
        there is 'shovel' event,
        gardenBedCell is empty
        => do nothing`,
    () => {
        let entity = manager.createEntity();
        entity.put(GardenBedCell.of(0, 0));
        manager.bindEntity(entity);
        eventManager.writeEvent('shovel', {tool: 'shovel', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };
        let expectEntity = entity.clone();

        let system = new ShovelSystem(manager);
        system.update('update', worldMock);

        expect(entity).toEqualEntity(expectEntity);
    });

test(`update(groupName, world):
        there is 'shovel' event,
        gardenBedCell is not empty
        => remove vegetable`,
    () => {
        let cell = manager.createEntity().put(GardenBedCell.of(0, 0));
        let vegetable = manager.createEntity().put(
            new VegetableMeta('Potato'), 
            new GardenBedCellLink(cell),
            fabric.growTimer('Potato')
        );
        cell.get(GardenBedCell).entity = vegetable;
        manager.bindEntity(cell);
        manager.bindEntity(vegetable);
        eventManager.writeEvent('shovel', {tool: 'shovel', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };

        let system = new ShovelSystem(manager);
        system.update('update', worldMock);
        let actual = cell.get(GardenBedCell).entity;

        expect(actual).toBeNull();
    });

test(`update(groupName, world):
        there is 'shovel' event,
        gardenBedCell is not empty
        => isAlive(vegetable) must return false`,
    () => {
        let cell = manager.createEntity().put(GardenBedCell.of(0, 0));
        let vegetable = manager.createEntity().put(
            new VegetableMeta('Potato'), 
            new GardenBedCellLink(cell),
            fabric.growTimer('Potato')
        );
        cell.get(GardenBedCell).entity = vegetable;
        manager.bindEntity(cell);
        manager.bindEntity(vegetable);
        eventManager.writeEvent('shovel', {tool: 'shovel', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };

        let system = new ShovelSystem(manager);
        system.update('update', worldMock);
        let actual = manager.isAlive(vegetable);

        expect(actual).toBe(false);
    });

test(`update(groupName, world):
        there is 'shovel' event,
        gardenBedCell is not empty
        => add money to wallet`,
    () => {
        let cell = manager.createEntity().put(GardenBedCell.of(0, 0));
        let vegetable = manager.createEntity().put(
            new VegetableMeta('Potato'), 
            new GardenBedCellLink(cell),
            fabric.growTimer('Potato', growStates.sprout)
        );
        cell.get(GardenBedCell).entity = vegetable;
        manager.bindEntity(cell);
        manager.bindEntity(vegetable);
        eventManager.writeEvent('shovel', {tool: 'shovel', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };

        let system = new ShovelSystem(manager);
        system.update('update', worldMock);
        let actual = wallet.get(Wallet).sum;

        expect(actual).toBe(47);
    });

test(`update(groupName, world):
        there is 'shovel' event,
        gardenBedCell doesn't contain VegetableMeta or GrowTimer
        => don't remove vegetable from gardenCell`,
    () => {
        let cell = manager.createEntity().put(GardenBedCell.of(0, 0));
        let ghost = manager.createEntity().addTags('sleeping seed').
                        put(new VegetableMeta('Potato'), new GardenBedCellLink(cell));
        cell.get(GardenBedCell).entity = ghost;
        manager.bindEntity(cell);
        manager.bindEntity(ghost);
        eventManager.writeEvent('shovel', {tool: 'shovel', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };

        let system = new ShovelSystem(manager);
        system.update('update', worldMock);
        let actual = cell.get(GardenBedCell).entity;

        expect(actual).toBe(ghost);
    });

test(`update(groupName, world):
        there is 'shovel' event,
        gardenBedCell doesn't contain VegetableMeta or GrowTimer
        => don't remove vegetable entity`,
    () => {
        let cell = manager.createEntity().put(GardenBedCell.of(0, 0));
        let ghost = manager.createEntity().addTags('sleeping seed').
                        put(new VegetableMeta('Potato'), new GardenBedCellLink(cell));
        cell.get(GardenBedCell).entity = ghost;
        manager.bindEntity(cell);
        manager.bindEntity(ghost);
        eventManager.writeEvent('shovel', {tool: 'shovel', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };

        let system = new ShovelSystem(manager);
        system.update('update', worldMock);
        let actual = manager.isAlive(ghost);

        expect(actual).toBe(true);
    });

