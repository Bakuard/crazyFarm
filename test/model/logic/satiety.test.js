const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {SatietySystem} = require('../../../src/code/model/logic/satiety.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');

let manager = null;
beforeEach(() => {
    manager = new EntityComponentManager();
    manager.registerComponents([Satiety]);
});

test(`satietySystem(groupName, world):
        update all satiety components`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(new Satiety(10, 1));
            entity2.put(new Satiety(10, 2));
            entity3.put(new Satiety(10, 4));
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
            
            let system = new SatietySystem();
            system.update('update', world);

            expect(entity1.get(Satiety).current).toEqual(8);
            expect(entity2.get(Satiety).current).toEqual(9);
            expect(entity3.get(Satiety).current).toEqual(9.5);
        });

test(`satietySystem(groupName, world):
        method was called too many times
        => each satiety.current must be 0`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(new Satiety(10, 1));
            entity2.put(new Satiety(10, 2));
            entity3.put(new Satiety(10, 4));
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
            
            let system = new SatietySystem();
            for(let i = 0; i < 100; i++) system.update('update', world);

            expect(entity1.get(Satiety).current).toEqual(0);
            expect(entity2.get(Satiety).current).toEqual(0);
            expect(entity3.get(Satiety).current).toEqual(0);
        });