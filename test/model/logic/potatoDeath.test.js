const {PotatoGhost} = require('../../../src/code/model/logic/potatoDeath.js');
const {PotatoDeathSystem} = require('../../../src/code/model/logic/potatoDeath.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');

let manager = null;
beforeEach(() => {
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
});

test(`update(groupName, world):
        elapsed time = potatoGhost.timeInMillis
        => isAlive(entity) must return false`,
    () => {
        let entity = manager.createEntity().put(
            new PotatoGhost(2000)
        );
        manager.bindEntity(entity);
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
        let entity = manager.createEntity().put(
            new PotatoGhost(2000)
        );
        manager.bindEntity(entity);
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
        let entity = manager.createEntity().put(
            new PotatoGhost(2000)
        );
        manager.bindEntity(entity);
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