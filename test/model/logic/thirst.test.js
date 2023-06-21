const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {ThirstSystem} = require('../../../src/code/model/logic/thirst.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');

let manager = null;
beforeEach(() => {
    manager = new EntityComponentManager();
    manager.registerComponents([Thirst]);
});

test(`thisrtSystem(groupName, world):
        update all thirst components`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(new Thirst(10, 1));
            entity2.put(new Thirst(10, 2));
            entity3.put(new Thirst(10, 4));
            manager.bindEntity(entity1); 
            manager.bindEntity(entity2); 
            manager.bindEntity(entity3); 
            manager.bindEntity(entity4);
            let world = {
                getGameLoop: () => {
                    return {
                        getElapsedTime: () => 2000
                    }
                },
                getEntityComponentManager: () => manager
            };
            
            let system = new ThirstSystem();
            system.update('update', world);

            expect(entity1.get(Thirst).current).toEqual(8);
            expect(entity2.get(Thirst).current).toEqual(9);
            expect(entity3.get(Thirst).current).toEqual(9.5);
        });

test(`thisrtSystem(groupName, world):
        method was called too many times
        => each thirst.current must be 0`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(new Thirst(10, 1));
            entity2.put(new Thirst(10, 2));
            entity3.put(new Thirst(10, 4));
            manager.bindEntity(entity1); 
            manager.bindEntity(entity2); 
            manager.bindEntity(entity3); 
            manager.bindEntity(entity4);
            let world = {
                getGameLoop: () => {
                    return {
                        getElapsedTime: () => 2000
                    }
                },
                getEntityComponentManager: () => manager
            };
            
            let system = new ThirstSystem();
            for(let i = 0; i < 100; i++) system.update('update', world);

            expect(entity1.get(Thirst).current).toEqual(0);
            expect(entity2.get(Thirst).current).toEqual(0);
            expect(entity3.get(Thirst).current).toEqual(0);
        });