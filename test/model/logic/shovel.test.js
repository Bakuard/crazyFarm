const {ShovelSystem} = require('../../../src/code/model/logic/shovel.js');
const {GardenBedCell} = require('../../../src/code/model/logic/gardenBedCell.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');

let manager = null;
let eventManager = null;
beforeEach(() => {
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    eventManager = new EventManager();
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
        let vegetable = manager.createEntity().addTags('sleeping seed').put(new VegetableMeta('Potato'), new GardenBedCellLink(cell));
        cell.get(GardenBedCell).vegetable = vegetable;
        manager.bindEntity(cell);
        manager.bindEntity(vegetable);
        eventManager.writeEvent('shovel', {tool: 'shovel', cell: 'center'});
        let worldMock = {
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };

        let system = new ShovelSystem(manager);
        system.update('update', worldMock);
        let actual = cell.get(GardenBedCell).vegetable;

        expect(actual).toBeNull();
    });

test(`update(groupName, world):
        there is 'shovel' event,
        gardenBedCell is not empty
        => isAlive(vegetable) must return false`,
    () => {
        let cell = manager.createEntity().put(GardenBedCell.of(0, 0));
        let vegetable = manager.createEntity().addTags('sleeping seed').put(new VegetableMeta('Potato'), new GardenBedCellLink(cell));
        cell.get(GardenBedCell).vegetable = vegetable;
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