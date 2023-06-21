const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {ImmunitySystem} = require('../../../src/code/model/logic/immunity.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');

let manager = null;
beforeEach(() => {
    manager = new EntityComponentManager();
    manager.registerComponents([Immunity]);
});

test(`diseaseSystem(groupName, world):
        update all thirst components`,
        () => {
            // let entity1 = manager.createEntity();
            // let entity2 = manager.createEntity();
            // let entity3 = manager.createEntity();
            // let entity4 = manager.createEntity();
            // entity1.put(new Immunity(10, 10, 1));
            // entity2.put(new Immunity(10, 10, 2));
            // entity3.put(new Immunity(10, 10, 4));
            // manager.bindEntity(entity1); 
            // manager.bindEntity(entity2); 
            // manager.bindEntity(entity3); 
            // manager.bindEntity(entity4);
            // let world = {
            //     getGameLoop: () => {
            //         return {
            //             getElapsedTime: () => 2000
            //         }
            //     },
            //     getEntityComponentManager: () => manager
            // };
            
            // let system = new ImmunitySystem();
            // system.update('update', world);

            // expect(entity1.get(Immunity).current).toEqual(8);
            // expect(entity2.get(Immunity).current).toEqual(9);
            // expect(entity3.get(Immunity).current).toEqual(9.5);
        });

test(`diseaseSystem(groupName, world):
        method was called too many times
        => each disease.current must be 0`,
        () => {
            // let entity1 = manager.createEntity();
            // let entity2 = manager.createEntity();
            // let entity3 = manager.createEntity();
            // let entity4 = manager.createEntity();
            // entity1.put(new Immunity(10, 10, 1));
            // entity2.put(new Immunity(10, 10, 2));
            // entity3.put(new Immunity(10, 10, 4));
            // manager.bindEntity(entity1); 
            // manager.bindEntity(entity2); 
            // manager.bindEntity(entity3); 
            // manager.bindEntity(entity4);
            // let world = {
            //     getGameLoop: () => {
            //         return {
            //             getElapsedTime: () => 2000
            //         }
            //     },
            //     getEntityComponentManager: () => manager
            // };
            
            // let system = new ImmunitySystem();
            // for(let i = 0; i < 100; i++) system.update('update', world);

            // expect(entity1.get(Immunity).current).toEqual(0);
            // expect(entity2.get(Immunity).current).toEqual(0);
            // expect(entity3.get(Immunity).current).toEqual(0);
        });