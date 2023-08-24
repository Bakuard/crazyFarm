const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {SatietySystem} = require('../../../src/code/model/logic/satiety.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {Wallet} = require('../../../src/code/model/logic/wallet.js');

let manager = null;
let eventManager = null;
let wallet = null;
beforeEach(() => {
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    eventManager = new EventManager();
    wallet = manager.createEntity().put(new Wallet(10, 2, 2, 3));
    manager.putSingletonEntity('wallet', wallet);
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

        expect(entity1.get(Satiety).current).toBe(8);
        expect(entity2.get(Satiety).current).toBe(9);
        expect(entity3.get(Satiety).current).toBe(9.5);
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

        expect(entity1.get(Satiety).current).toBe(0);
        expect(entity2.get(Satiety).current).toBe(0);
        expect(entity3.get(Satiety).current).toBe(0);
    });
    
test(`update(groupName, world):
        there is not 'fertilizer' event
        => satiety.current mustn't be max`,
    () => {
        let entity = manager.createEntity();
        entity.put(Satiety.of(10, 1));
        manager.bindEntity(entity); 
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

        expect(entity.get(Satiety).current).not.toBe(entity.get(Satiety).max);
    });

test(`update(groupName, world):
        there is 'fertilizer' event,
        wallet has enough money
        => satiety.current must be max`,
    () => {
        let entity = manager.createEntity();
        entity.put(Satiety.of(10, 1));
        manager.bindEntity(entity); 
        let worldMock = {
            getGameLoop: () => {
                return {
                    getElapsedTime: () => 10000
                }
            },
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };
        eventManager.writeEvent('fertilizer', {tool: 'fertilizer', cell: 'center'});

        let system = new SatietySystem(manager);
        system.update('update', worldMock);

        expect(entity.get(Satiety).current).toBe(entity.get(Satiety).max);
    });

test(`update(groupName, world):
        there is 'fertilizer' event,
        wallet has enough money
        => money must be deducted from the wallet`,
    () => {
        let entity = manager.createEntity();
        entity.put(Satiety.of(10, 1));
        manager.bindEntity(entity); 
        let worldMock = {
            getGameLoop: () => {
                return {
                    getElapsedTime: () => 10000
                }
            },
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };
        eventManager.writeEvent('fertilizer', {tool: 'fertilizer', cell: 'center'});

        let system = new SatietySystem(manager);
        system.update('update', worldMock);

        expect(wallet.get(Wallet).sum).toBe(8);
    });

test(`update(groupName, world):
        there is 'fertilizer' event,
        wallet hasn't enough money
        => satiety.current mustn't be max`,
    () => {
        let entity = manager.createEntity();
        entity.put(Satiety.of(10, 1));
        manager.bindEntity(entity); 
        let worldMock = {
            getGameLoop: () => {
                return {
                    getElapsedTime: () => 10000
                }
            },
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };
        eventManager.writeEvent('fertilizer', {tool: 'fertilizer', cell: 'center'});
        wallet.get(Wallet).sum = 0;

        let system = new SatietySystem(manager);
        system.update('update', worldMock);

        expect(entity.get(Satiety).current).not.toBe(entity.get(Satiety).max);
    });

test(`update(groupName, world):
        there is 'fertilizer' event,
        wallet hasn't enough money
        => money mustn't be deducted from the wallet`,
    () => {
        let entity = manager.createEntity();
        entity.put(Satiety.of(10, 1));
        manager.bindEntity(entity); 
        let worldMock = {
            getGameLoop: () => {
                return {
                    getElapsedTime: () => 10000
                }
            },
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };
        eventManager.writeEvent('fertilizer', {tool: 'fertilizer', cell: 'center'});
        wallet.get(Wallet).sum = 1;

        let system = new SatietySystem(manager);
        system.update('update', worldMock);

        expect(wallet.get(Wallet).sum).toBe(1);
    });