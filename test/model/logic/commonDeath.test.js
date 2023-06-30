const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {EntityMeta} = require('../../../src/code/model/logic/entityMeta.js');
const {PotatoGhost} = require('../../../src/code/model/logic/potatoDeath.js');
const {DeathSystem} = require('../../../src/code/model/logic/commonDeath.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EntityFilter} = require('../../../src/code/model/gameEngine/entityComponentManager.js');

let manager = null;
beforeEach(() => {
    manager = new EntityComponentManager(new EntityManager());
    manager.registerComponents([PotatoGhost, Thirst, Satiety, Immunity, EntityMeta]);
});

test(`update(groupName, world):
        satiety > 0,
        thirst > 0,
        immunity > 0,
        method was called many times
        => entity mustn't die`,
    () => {
        let entity = manager.createEntity().put(
            new Thirst(10, 1, 1),
            new Satiety(10, 1, 1),
            new Immunity(10, 1, false, 1, 0),
            new EntityMeta('Potato')
        );
        manager.bindEntity(entity);
        let worldMock = {
            getEntityComponentManager: () => manager
        };

        let system = new DeathSystem();
        for(let i = 0; i < 100; i++) system.update('update', worldMock);
        let filter = new EntityFilter().all(PotatoGhost);
        let generator = manager.select(filter);
        let actual = [...generator];

        expect(actual).toHaveLength(0);
    });

test(`update(groupName, world):
    satiety = 0,
    thirst > 0,
    immunity > 0
    => entity must die`,
    () => {
        let entity = manager.createEntity().put(
            new Thirst(10, 1, 1),
            new Satiety(10, 0, 1),
            new Immunity(10, 1, false, 1, 0),
            new EntityMeta('Potato')
        );
        manager.bindEntity(entity);
        let worldMock = {
            getEntityComponentManager: () => manager
        };

        let system = new DeathSystem();
        system.update('update', worldMock);
        let filter = new EntityFilter().all(PotatoGhost);
        let generator = manager.select(filter);
        let actual = [...generator];

        expect(actual).containsEntities(entity);
    });

test(`update(groupName, world):
    satiety > 0,
    thirst = 0,
    immunity > 0
    => entity must die`,
    () => {
        let entity = manager.createEntity().put(
            new Thirst(10, 0, 1),
            new Satiety(10, 1, 1),
            new Immunity(10, 1, false, 1, 0),
            new EntityMeta('Potato')
        );
        manager.bindEntity(entity);
        let worldMock = {
            getEntityComponentManager: () => manager
        };

        let system = new DeathSystem();
        system.update('update', worldMock);
        let filter = new EntityFilter().all(PotatoGhost);
        let generator = manager.select(filter);
        let actual = [...generator];

        expect(actual).containsEntities(entity);
    });

test(`update(groupName, world):
    satiety > 0,
    thirst > 0,
    immunity = 0
    => entity must die`,
    () => {
        let entity = manager.createEntity().put(
            new Thirst(10, 1, 1),
            new Satiety(10, 1, 1),
            new Immunity(10, 0, false, 1, 1),
            new EntityMeta('Potato')
        );
        manager.bindEntity(entity);
        let worldMock = {
            getEntityComponentManager: () => manager
        };

        let system = new DeathSystem();
        system.update('update', worldMock);
        let filter = new EntityFilter().all(PotatoGhost);
        let generator = manager.select(filter);
        let actual = [...generator];

        expect(actual).containsEntities(entity);
    });