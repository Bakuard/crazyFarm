const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {SatietySystem} = require('../../../src/code/model/logic/satiety.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');

let manager = null;
let eventManager = null;
beforeEach(() => {
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    eventManager = new EventManager();
});

test(`update(groupName, world):
        update all satiety components`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(Satiety.of(10, 1));
            entity2.put(Satiety.of(10, 2));
            entity3.put(Satiety.of(10, 4));
            manager.bindEntity(entity1); 
            manager.bindEntity(entity2); 
            manager.bindEntity(entity3); 
            manager.bindEntity(entity4);
            let worldMock = {
                getGameLoop: () => {
                    return {
                        getElapsedTime: () => 2000
                    }
                },
                getEntityComponentManager: () => manager,
                getEventManager: () => eventManager
            };
            
            let system = new SatietySystem(manager);
            system.update('update', worldMock);

            expect(entity1.get(Satiety).current).toEqual(8);
            expect(entity2.get(Satiety).current).toEqual(9);
            expect(entity3.get(Satiety).current).toEqual(9.5);
        });

test(`update(groupName, world):
        method was called too many times
        => each satiety.current must be 0`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(Satiety.of(10, 1));
            entity2.put(Satiety.of(10, 2));
            entity3.put(Satiety.of(10, 4));
            manager.bindEntity(entity1); 
            manager.bindEntity(entity2); 
            manager.bindEntity(entity3); 
            manager.bindEntity(entity4);
            let worldMock = {
                getGameLoop: () => {
                    return {
                        getElapsedTime: () => 2000
                    }
                },
                getEntityComponentManager: () => manager,
                getEventManager: () => eventManager
            };
            
            let system = new SatietySystem(manager);
            for(let i = 0; i < 100; i++) system.update('update', worldMock);

            expect(entity1.get(Satiety).current).toEqual(0);
            expect(entity2.get(Satiety).current).toEqual(0);
            expect(entity3.get(Satiety).current).toEqual(0);
        });