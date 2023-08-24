const {GrowTimer, growStates, GrowTimerSystem} = require('../../../src/code/model/logic/growTimer.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');

let manager = null;
beforeEach(() => {
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
});

test(`GrowTimer(growState, intervalsInSeconds):
        growTimer.currentTimeInMillis must be correct for that growState`,
        () => {
            let component1 = GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]);
            let component2 = GrowTimer.of(growStates.sprout, [10, 20, 20, 30, 30]);
            let component3 = GrowTimer.of(growStates.child, [10, 20, 20, 30, 30]);
            let component4 = GrowTimer.of(growStates.youth, [10, 20, 20, 30, 30]);
            let component5 = GrowTimer.of(growStates.adult, [10, 20, 20, 30, 30]);

            expect(component1.currentTimeInMillis).toBe(0);
            expect(component2.currentTimeInMillis).toBe(10000);
            expect(component3.currentTimeInMillis).toBe(30000);
            expect(component4.currentTimeInMillis).toBe(50000);
            expect(component5.currentTimeInMillis).toBe(80000);
        });

test(`update(groupName, world):
        init growTimer with growState=seed,
        call update one time with too small elapsedTime
        => don't change any components`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]));
            entity2.put(GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]));
            entity3.put(GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]));
            manager.bindEntity(entity1); 
            manager.bindEntity(entity2); 
            manager.bindEntity(entity3); 
            manager.bindEntity(entity4);
            let worldMock = {
                getGameLoop: () => {
                    return {
                        getElapsedTime: () => 100
                    }
                },
                getEntityComponentManager: () => manager
            };
            
            let system = new GrowTimerSystem(manager);
            system.update('update', worldMock);

            expect(entity1.get(GrowTimer).growState).toBe(growStates.seed);
            expect(entity2.get(GrowTimer).growState).toBe(growStates.seed);
            expect(entity3.get(GrowTimer).growState).toBe(growStates.seed);
        });

test(`update(groupName, world):
        init growTimer with growState=seed,
        call update one time with very long elapsedTime
        => change growState of components`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]));
            entity2.put(GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]));
            entity3.put(GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]));
            manager.bindEntity(entity1); 
            manager.bindEntity(entity2); 
            manager.bindEntity(entity3); 
            manager.bindEntity(entity4);
            let worldMock = {
                getGameLoop: () => {
                    return {
                        getElapsedTime: () => 10000
                    }
                },
                getEntityComponentManager: () => manager
            };
            
            let system = new GrowTimerSystem(manager);
            system.update('update', worldMock);

            expect(entity1.get(GrowTimer).growState).toBe(growStates.sprout);
            expect(entity2.get(GrowTimer).growState).toBe(growStates.sprout);
            expect(entity3.get(GrowTimer).growState).toBe(growStates.sprout);
        });

test(`update(groupName, world):
        init growTimer with growState=seed,
        call update several time with short elapsedTime
        => change growState of components`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]));
            entity2.put(GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]));
            entity3.put(GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]));
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
            
            let system = new GrowTimerSystem(manager);
            for(let i = 0; i < 45; i++) system.update('update', worldMock);

            expect(entity1.get(GrowTimer).growState).toBe(growStates.child);
            expect(entity2.get(GrowTimer).growState).toBe(growStates.child);
            expect(entity3.get(GrowTimer).growState).toBe(growStates.child);
        });

test(`update(groupName, world):
        init growTimer with growState=seed,
        call update several time with short elapsedTime,
        total elapsedTime > sum of growTimer.intervalsInSeconds
        => set last growState of components`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]));
            entity2.put(GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]));
            entity3.put(GrowTimer.of(growStates.seed, [10, 20, 20, 30, 30]));
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
            
            let system = new GrowTimerSystem(manager);
            for(let i = 0; i < 200; i++) system.update('update', worldMock);

            expect(entity1.get(GrowTimer).growState).toBe(growStates.adult);
            expect(entity2.get(GrowTimer).growState).toBe(growStates.adult);
            expect(entity3.get(GrowTimer).growState).toBe(growStates.adult);
        });