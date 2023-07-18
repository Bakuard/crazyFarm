const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {ImmunitySystem} = require('../../../src/code/model/logic/immunity.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const { EntityManager } = require('../../../src/code/model/gameEngine/entityManager.js');
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
        there are not components with isSick=true,
        method is called several times
        => none of the components should be changed`,
    () => {
        let entity1 = manager.createEntity();
        let entity2 = manager.createEntity();
        let entity3 = manager.createEntity();
        let entity4 = manager.createEntity();
        entity1.put(Immunity.of(10, 1, 0.5));
        entity2.put(Immunity.of(10, 1, 0.5));
        entity3.put(Immunity.of(10, 1, 0.5));
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
            getEntityComponentManager: () => manager,
            getEventManager: () => eventManager
        };
        let randomGeneratorMock = () => 0.6;
        
        let system = new ImmunitySystem(randomGeneratorMock, manager);
        for(let i = 0; i < 100; i++) system.update('update', worldMock);

        expect(entity1.get(Immunity)).toEqual(Immunity.of(10, 1, 0.5));
        expect(entity2.get(Immunity)).toEqual(Immunity.of(10, 1, 0.5));
        expect(entity3.get(Immunity)).toEqual(Immunity.of(10, 1, 0.5));
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
        entity1.put(Immunity.of(10, 1, 0.5));
        entity2.put(Immunity.of(10, 2, 0.5));
        entity3.put(Immunity.of(10, 4, 0.5));
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
        let randomGeneratorMock = () => 0.4;
        
        let system = new ImmunitySystem(randomGeneratorMock, manager);
        system.update('update', worldMock);

        expect(entity1.get(Immunity).current).toEqual(8);
        expect(entity2.get(Immunity).current).toEqual(9);
        expect(entity3.get(Immunity).current).toEqual(9.5);
    });