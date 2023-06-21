const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {ImmunitySystem} = require('../../../src/code/model/logic/immunity.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');

let manager = null;
beforeEach(() => {
    manager = new EntityComponentManager();
    manager.registerComponents([Immunity]);
});

test(`update(groupName, world):
        there are not components with isSick=true,
        method is called several times
        => none of the components should be changed`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(new Immunity(10, 1, 0.5));
            entity2.put(new Immunity(10, 1, 0.5));
            entity3.put(new Immunity(10, 1, 0.5));
            manager.bindEntity(entity1); 
            manager.bindEntity(entity2); 
            manager.bindEntity(entity3); 
            manager.bindEntity(entity4);
            let worldMock = {
                getGameLoop: () => {
                    return {
                        getElapsedTime: () => 1000
                    }
                },
                getEntityComponentManager: () => manager
            };
            let randomGeneratorMock = () => 0.6;
            
            let system = new ImmunitySystem(randomGeneratorMock);
            for(let i = 0; i < 100; i++) system.update('update', worldMock);

            expect(entity1.get(Immunity)).toEqual(new Immunity(10, 1, 0.5));
            expect(entity2.get(Immunity)).toEqual(new Immunity(10, 1, 0.5));
            expect(entity3.get(Immunity)).toEqual(new Immunity(10, 1, 0.5));
        });

test(`update(groupName, world):
        there are components with isSick=true,
        method is called one time
        => update components with isSick=true`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(new Immunity(10, 1, 0.5));
            entity2.put(new Immunity(10, 2, 0.5));
            entity3.put(new Immunity(10, 4, 0.5));
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
                getEntityComponentManager: () => manager
            };
            let randomGeneratorMock = () => 0.4;
            
            let system = new ImmunitySystem(randomGeneratorMock);
            system.update('update', worldMock);

            expect(entity1.get(Immunity).current).toEqual(8);
            expect(entity2.get(Immunity).current).toEqual(9);
            expect(entity3.get(Immunity).current).toEqual(9.5);
        });