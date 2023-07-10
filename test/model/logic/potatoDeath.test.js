const {PotatoGhost} = require('../../../src/code/model/logic/potatoDeath.js');
const {PotatoDeathSystem} = require('../../../src/code/model/logic/potatoDeath.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {GardenBedCell} = require('../../../src/code/model/logic/gardenBedCell.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');

let manager = null;
let compGeneratorId = null;
beforeEach(() => {
    compGeneratorId = new ComponentIdGenerator();
    manager = new EntityComponentManager(new EntityManager(), compGeneratorId);
});

test(`update(groupName, world):
        elapsed time = potatoGhost.timeInMillis
        => isAlive(entity) must return false`,
    () => {
        let cell = manager.createEntity().put(new GardenBedCell(0, 0));
        let entity = manager.createEntity().put(
            new PotatoGhost(2000),
            new GardenBedCellLink(cell)
        );
        cell.get(GardenBedCell).vegetable = entity;
        manager.bindEntity(entity);
        manager.bindEntity(cell);
        let worldMock = {
            getGameLoop: () => {
                    return {
                        getElapsedTime: () => 2000
                    }
                },
            getEntityComponentManager: () => manager
        };

        let system = new PotatoDeathSystem(manager);
        system.update('update', worldMock);
        let actual = manager.isAlive(entity);

        expect(actual).toBe(false);
    });

test(`update(groupName, world):
    elapsed time > potatoGhost.timeInMillis
    => isAlive(entity) must return false`,
    () => {
        let cell = manager.createEntity().put(new GardenBedCell(0, 0));
        let entity = manager.createEntity().put(
            new PotatoGhost(2000),
            new GardenBedCellLink(cell)
        );
        cell.get(GardenBedCell).vegetable = entity;
        manager.bindEntity(entity);
        manager.bindEntity(cell);
        let worldMock = {
            getGameLoop: () => {
                    return {
                        getElapsedTime: () => 2001
                    }
                },
            getEntityComponentManager: () => manager
        };

        let system = new PotatoDeathSystem(manager);
        system.update('update', worldMock);
        let actual = manager.isAlive(entity);

        expect(actual).toBe(false);
    });

test(`update(groupName, world):
    elapsed time < potatoGhost.timeInMillis
    => isAlive(entity) must return true`,
    () => {
        let cell = manager.createEntity().put(new GardenBedCell(0, 0));
        let entity = manager.createEntity().put(
            new PotatoGhost(2000),
            new GardenBedCellLink(cell)
        );
        cell.get(GardenBedCell).vegetable = entity;
        manager.bindEntity(entity);
        manager.bindEntity(cell);
        let worldMock = {
            getGameLoop: () => {
                    return {
                        getElapsedTime: () => 1999
                    }
                },
            getEntityComponentManager: () => manager
        };

        let system = new PotatoDeathSystem(manager);
        system.update('update', worldMock);
        let actual = manager.isAlive(entity);

        expect(actual).toBe(true);
    });

test(`update(groupName, world):
        potatoGhost was deleted
        => clear gardenBedCell`,
    () => {
        let cell = manager.createEntity().put(new GardenBedCell(0, 0));
        let entity = manager.createEntity().put(
            new PotatoGhost(2000),
            new GardenBedCellLink(cell)
        );
        cell.get(GardenBedCell).vegetable = entity;
        manager.bindEntity(entity);
        manager.bindEntity(cell);
        let worldMock = {
            getGameLoop: () => {
                    return {
                        getElapsedTime: () => 2001
                    }
                },
            getEntityComponentManager: () => manager
        };

        let system = new PotatoDeathSystem(manager);
        system.update('update', worldMock);
        let actual = cell.get(GardenBedCell).vegetable;

        expect(actual).toBeNull();
    });