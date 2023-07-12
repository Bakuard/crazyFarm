const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {GrowTimer, growStates} = require('../../../src/code/model/logic/growTimer.js');
const {PotatoGhost} = require('../../../src/code/model/logic/potatoDeath.js');
const {PotatoDeathSystem} = require('../../../src/code/model/logic/potatoDeath.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {GardenBedCell} = require('../../../src/code/model/logic/gardenBedCell.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {Fabric} = require('../../../src/code/model/logic/fabric.js');

let fabric = null;
let manager = null;
let compGeneratorId = null;
beforeEach(() => {
    fabric = new Fabric({
        potato: {
            ghost: {
                timeInMillis: 2000
            }
        }
    });
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
        cell.get(GardenBedCell).entity = entity;
        manager.bindEntity(entity);
        manager.bindEntity(cell);
        let worldMock = {
            getGameLoop: () => {
                return { getElapsedTime: () => 2000 }
            },
            getEntityComponentManager: () => manager
        };

        let system = new PotatoDeathSystem(manager, fabric);
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
        cell.get(GardenBedCell).entity = entity;
        manager.bindEntity(entity);
        manager.bindEntity(cell);
        let worldMock = {
            getGameLoop: () => {
                return { getElapsedTime: () => 2001 }
            },
            getEntityComponentManager: () => manager
        };

        let system = new PotatoDeathSystem(manager, fabric);
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
        cell.get(GardenBedCell).entity = entity;
        manager.bindEntity(entity);
        manager.bindEntity(cell);
        let worldMock = {
            getGameLoop: () => {
                return { getElapsedTime: () => 1999 }
            },
            getEntityComponentManager: () => manager
        };

        let system = new PotatoDeathSystem(manager, fabric);
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
        cell.get(GardenBedCell).entity = entity;
        manager.bindEntity(entity);
        manager.bindEntity(cell);
        let worldMock = {
            getGameLoop: () => {
                    return { getElapsedTime: () => 2001 }
            },
            getEntityComponentManager: () => manager
        };

        let system = new PotatoDeathSystem(manager, fabric);
        system.update('update', worldMock);
        let actual = cell.get(GardenBedCell).entity;

        expect(actual).toBeNull();
    });

test(`update(groupName, world):
        there are potatos with tags 'Potato' and 'dead'
        => remove this tags and components Immuntiy, Satiety, Thirst and GrowTimer. Add PotatoGhost component.`,
    () => {
        let cell = manager.createEntity().put(new GardenBedCell(0, 0));
        let entity = manager.createEntity().put(
            new GardenBedCellLink(cell),
            GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]),
            Immunity.of(60, 1, 0.2),
            Satiety.of(60, 1),
            Thirst.of(60, 1)
        ).addTags('Potato', 'dead');
        cell.get(GardenBedCell).entity = entity;
        manager.bindEntity(entity);
        manager.bindEntity(cell);
        let worldMock = {
            getGameLoop: () => {
                    return { getElapsedTime: () => 1999 }
            },
            getEntityComponentManager: () => manager
        };

        let system = new PotatoDeathSystem(manager, fabric);
        system.update('update', worldMock);

        expect(entity.hasComponents(GrowTimer)).toBe(false);
        expect(entity.hasComponents(Immunity)).toBe(false);
        expect(entity.hasComponents(Satiety)).toBe(false);
        expect(entity.hasComponents(Thirst)).toBe(false);
        expect(entity.hasTags('Potato')).toBe(false);
        expect(entity.hasTags('dade')).toBe(false);
        expect(entity.hasComponents(PotatoGhost)).toBe(true);
    });