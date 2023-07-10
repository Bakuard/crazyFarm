const {WorldLogger} = require('../../../src/code/model/logic/worldLogger.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');

let manager = null;
beforeEach(() => {
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
});

test(`update(groupName, world):
        world is empty
        => doesn't throw amy exceptions`,
    () => {
        let gameLoopMock = {
            getFrameNumberSinceStart: () => 10
        };
        let worldMock = {
            getEntityComponentManager: () => manager,
            getGameLoop: () => gameLoopMock
        };

        let system = new WorldLogger(manager, '123456789');
        expect(() => system.update('group', worldMock)).not.toThrow();
    });

test(`update(groupName, world):
        world is not empty
        => doesn't throw amy exceptions`,
    () => {
        let entity1 = manager.createEntity();
        let entity2 = manager.createEntity();
        let entity3 = manager.createEntity();
        let entity4 = manager.createEntity();
        entity1.put(new VegetableMeta('A')).addTags('a', 'b', 'c');
        entity2.put(new VegetableMeta('B')).addTags('a', 'b', 'd');
        entity3.put(new VegetableMeta('C')).addTags('a', 'b', 'e');
        manager.bindEntity(entity1); 
        manager.bindEntity(entity2); 
        manager.bindEntity(entity3); 
        manager.bindEntity(entity4);
        let gameLoopMock = {
            getFrameNumberSinceStart: () => 10
        };
        let worldMock = {
            getEntityComponentManager: () => manager,
            getGameLoop: () => gameLoopMock
        };

        let system = new WorldLogger(manager, '123456789');
        expect(() => system.update('group', worldMock)).not.toThrow();
    });