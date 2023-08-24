const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {DeathSystem} = require('../../../src/code/model/logic/commonDeath.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');

let manager = null;
beforeEach(() => {
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
});

test(`update(groupName, world):
        satiety > 0,
        thirst > 0,
        immunity > 0,
        method was called many times
        => don't add tags with values 'dead' and vegetableMeta.typeName`,
    () => {
        let entity = manager.createEntity().put(
            new Thirst(10, 1, 1),
            new Satiety(10, 1, 1),
            new Immunity(10, 1, false, 1, 0),
            new VegetableMeta('Potato')
        );
        manager.bindEntity(entity);
        let worldMock = {
            getEntityComponentManager: () => manager
        };

        let system = new DeathSystem(manager);
        for(let i = 0; i < 100; i++) system.update('update', worldMock);
        let filter = manager.createFilter().allTags('dead', 'Potato');
        let generator = manager.select(filter);
        let actual = [...generator];

        expect(actual).toHaveLength(0);
    });

test(`update(groupName, world):
    satiety = 0,
    thirst > 0,
    immunity > 0
    => add tags with values 'dead' and vegetableMeta.typeName`,
    () => {
        let entity = manager.createEntity().put(
            new Thirst(10, 1, 1),
            new Satiety(10, 0, 1),
            new Immunity(10, 1, false, 1, 0),
            new VegetableMeta('Potato')
        );
        manager.bindEntity(entity);
        let worldMock = {
            getEntityComponentManager: () => manager
        };

        let system = new DeathSystem(manager);
        system.update('update', worldMock);
        let filter = manager.createFilter().allTags('dead', 'Potato');
        let generator = manager.select(filter);
        let actual = [...generator];

        expect(actual).containsEntities(entity);
    });

test(`update(groupName, world):
    satiety > 0,
    thirst = 0,
    immunity > 0
    => add tags with values 'dead' and vegetableMeta.typeName`,
    () => {
        let entity = manager.createEntity().put(
            new Thirst(10, 0, 1),
            new Satiety(10, 1, 1),
            new Immunity(10, 1, false, 1, 0),
            new VegetableMeta('Potato')
        );
        manager.bindEntity(entity);
        let worldMock = {
            getEntityComponentManager: () => manager
        };

        let system = new DeathSystem(manager);
        system.update('update', worldMock);
        let filter = manager.createFilter().allTags('dead', 'Potato');
        let generator = manager.select(filter);
        let actual = [...generator];

        expect(actual).containsEntities(entity);
    });

test(`update(groupName, world):
    satiety > 0,
    thirst > 0,
    immunity = 0
    => add tags with values 'dead' and vegetableMeta.typeName`,
    () => {
        let entity = manager.createEntity().put(
            new Thirst(10, 1, 1),
            new Satiety(10, 1, 1),
            new Immunity(10, 0, false, 1, 1),
            new VegetableMeta('Potato')
        );
        manager.bindEntity(entity);
        let worldMock = {
            getEntityComponentManager: () => manager
        };

        let system = new DeathSystem(manager);
        system.update('update', worldMock);
        let filter = manager.createFilter().allTags('dead', 'Potato');
        let generator = manager.select(filter);
        let actual = [...generator];

        expect(actual).containsEntities(entity);
    });