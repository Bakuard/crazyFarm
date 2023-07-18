const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {SleepingSeedSystem} = require('../../../src/code/model/logic/sleepingSeed.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {GardenBedCell} = require('../../../src/code/model/logic/gardenBedCell.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {GrowTimer} = require('../../../src/code/model/logic/growTimer.js');
const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {Fabric} = require('../../../src/code/model/logic/fabric.js');
const {Wallet} = require('../../../src/code/model/logic/wallet.js');

let fabric = null;
let manager = null;
let eventManager = null;
let wallet = null;
beforeEach(() => {
    fabric = Fabric.createWithDefaultSettings();
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    eventManager = new EventManager();
    wallet = manager.createEntity().put(new Wallet(10, 2, 2, 3));
    manager.putSingletonEntity('wallet', wallet);
    manager.putSingletonEntity('fabric', fabric);
});

test(`update(groupName, world):
        there are not 'seeds' events,
        there are not 'bailer' events
        => do nothing`,
    () => {
        let entity1 = manager.createEntity();
        let entity2 = manager.createEntity();
        entity1.put(GardenBedCell.of(0, 0));
        entity2.addTags('sleeping seed');
        manager.bindEntity(entity1);
        manager.bindEntity(entity2);
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };
        let expectEntity1 = entity1.clone();
        let expectEntity2 = entity2.clone();

        let system = new SleepingSeedSystem(manager, fabric);
        system.update('update', worldMock);

        expect(entity1).toEqualEntity(expectEntity1);
        expect(entity2).toEqualEntity(expectEntity2);
    });

test(`update(groupName, world):
        there are 'bailer' events,
        there are not entities with 'sleeping seed' tag
        => do nothing`,
    () => {
        let entity = manager.createEntity();
        entity.put(GardenBedCell.of(0, 0));
        manager.bindEntity(entity);
        eventManager.writeEvent('bailer', {tool: 'bailer', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };
        let expectEntity = entity.clone();

        let system = new SleepingSeedSystem(manager, fabric);
        system.update('update', worldMock);

        expect(entity).toEqualEntity(expectEntity);
    });

test(`update(groupName, world):
        there are 'seeds' events,
        there are not entities with GardenBedCell component
        => do nothing`,
    () => {
        let entity = manager.createEntity();
        entity.addTags('sleeping seed');
        manager.bindEntity(entity);
        eventManager.writeEvent('seeds', {tool: 'seeds', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };
        let expectEntity = entity.clone();

        let system = new SleepingSeedSystem(manager, fabric);
        system.update('update', worldMock);

        expect(entity).toEqualEntity(expectEntity);
    });

test(`update(groupName, world):
        there are 'seeds' events,
        there are entities with GardenBedCell component and GardenBedCell.vegetable is defined
        => do nothing`,
    () => {
        let entity1 = manager.createEntity();
        let entity2 = manager.createEntity();
        entity1.put(new GardenBedCell(0, 0, entity2));
        entity2.addTags('sleeping seed', 'some other tag');
        manager.bindEntity(entity1);
        manager.bindEntity(entity2);
        eventManager.writeEvent('seeds', {tool: 'seeds', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };
        let expectEntity1 = entity1.clone();
        let expectEntity2 = entity2.clone();

        let system = new SleepingSeedSystem(manager, fabric);
        system.update('update', worldMock);

        expect(entity1).toEqualEntity(expectEntity1);
        expect(entity2).toEqualEntity(expectEntity2);
    });

test(`update(groupName, world):
        there are 'seeds' events,
        there are entities with GardenBedCell component and GardenBedCell.vegetable is not defined,
        user has enough money
        => plant new vegatable`,
    () => {
        let entity = manager.createEntity();
        entity.put(GardenBedCell.of(0, 0));
        manager.bindEntity(entity);
        eventManager.writeEvent('seeds', {tool: 'seeds', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };

        let system = new SleepingSeedSystem(manager, fabric);
        system.update('update', worldMock);
        let filter = manager.createFilter().all(VegetableMeta);
        let actual = [...manager.select(filter)];

        expect(actual[0].hasComponents(VegetableMeta, GardenBedCellLink)).toBe(true);
    });

test(`update(groupName, world):
        there are 'seeds' events,
        there are entities with GardenBedCell component and GardenBedCell.vegetable is not defined,
        user has enough money
        => money must be deducted from the wallet`,
    () => {
        let entity = manager.createEntity();
        entity.put(GardenBedCell.of(0, 0));
        manager.bindEntity(entity);
        eventManager.writeEvent('seeds', {tool: 'seeds', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };

        let system = new SleepingSeedSystem(manager, fabric);
        system.update('update', worldMock);

        expect(wallet.get(Wallet).sum).toBe(7);
    });

test(`update(groupName, world):
        there are 'seeds' events,
        there are entities with GardenBedCell component and GardenBedCell.vegetable is not defined,
        user hasn't enough money
        => do nothing`,
    () => {
        let entity = manager.createEntity();
        entity.put(GardenBedCell.of(0, 0));
        manager.bindEntity(entity);
        eventManager.writeEvent('seeds', {tool: 'seeds', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };
        wallet.get(Wallet).sum = 2;
        let expectEntity = entity.clone();

        let system = new SleepingSeedSystem(manager, fabric);
        system.update('update', worldMock);

        expect(entity).toEqualEntity(expectEntity);
    });

test(`update(groupName, world):
        there are 'seeds' events,
        there are entities with GardenBedCell component and GardenBedCell.vegetable is not defined,
        user hasn't enough money
        => money mustn't be deducted from the wallet`,
    () => {
        let entity = manager.createEntity();
        entity.put(GardenBedCell.of(0, 0));
        manager.bindEntity(entity);
        eventManager.writeEvent('seeds', {tool: 'seeds', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };
        wallet.get(Wallet).sum = 2;

        let system = new SleepingSeedSystem(manager, fabric);
        system.update('update', worldMock);

        expect(wallet.get(Wallet).sum).toBe(2);
    });

test(`update(groupName, world):
    there are 'bailer' events,
    there are entities with 'sleeping seed' tag
    => start grow this vegatable`,
    () => {
        let entity = manager.createEntity();
        entity.addTags('sleeping seed').put(new VegetableMeta('Potato'));
        manager.bindEntity(entity);
        eventManager.writeEvent('bailer', {tool: 'bailer', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };

        let system = new SleepingSeedSystem(manager, fabric);
        system.update('update', worldMock);
        let filter = manager.createFilter().all(VegetableMeta);
        let actual = [...manager.select(filter)];

        expect(actual[0].hasComponents(VegetableMeta, GrowTimer, Immunity, Satiety, Thirst)).toBe(true);
    });

test(`update(groupName, world):
        there are 'bailer' events,
        there are entities with 'sleeping seed' tag
        => money mustn't be deducted from the wallet`,
    () => {
        let entity = manager.createEntity();
        entity.addTags('sleeping seed').put(new VegetableMeta('Potato'));
        manager.bindEntity(entity);
        eventManager.writeEvent('bailer', {tool: 'bailer', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };

        let system = new SleepingSeedSystem(manager, fabric);
        system.update('update', worldMock);

        expect(wallet.get(Wallet).sum).toBe(10);
    });