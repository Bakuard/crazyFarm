const {PlantNewVegetableSystem} = require('../../../src/code/model/logic/plantNewVegetable.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {GardenBedCell} = require('../../../src/code/model/logic/gardenBedCell.js');
const {VegetableState} = require('../../../src/code/model/logic/vegetableState.js');
const {Fabric} = require('../../../src/code/model/logic/fabric.js');
const {Wallet} = require('../../../src/code/model/logic/wallet.js');

let fabric = null;
let manager = null;
let eventManager = null;
let wallet = null;
beforeEach(() => {
    fabric = new Fabric({
        potato: {
            seedProbability: {
                min: 0.5,
                max: 1
            },
            meta: {
                typeName: 'Potato'
            },
            vegetableState: {
                seedDetail: {
                    intervalInSecond: 10,
                    lifeCyleState: 'seed'
                },
                sproutDetail: {
                    intervalInSecond: 10,
                    lifeCyleState: 'sprout'
                },
                chidlDetail: {
                    intervalInSecond: 10,
                    lifeCyleState: 'child'
                },
                youthDetail: {
                    intervalInSecond: 10,
                    lifeCyleState: 'youth'
                }
            }
        },
        tomato: {
            seedProbability: {
                min: 0,
                max: 0.5
            },
            meta: {
                typeName: 'Tomato'
            },
            vegetableState: {
                seedDetail: {
                    intervalInSecond: 10,
                    lifeCyleState: 'seed'
                },
                sproutDetail: {
                    intervalInSecond: 10,
                    lifeCyleState: 'sprout'
                },
                chidlDetail: {
                    intervalInSecond: 10,
                    lifeCyleState: 'child'
                },
                youthDetail: {
                    intervalInSecond: 10,
                    lifeCyleState: 'youth'
                }
            }
        },
        wallet: {
            sum: 20,
            fertilizerPrice: 2,
            sprayerPrice: 2,
            seedsPrice: 3
        }
    });
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    manager.putSingletonEntity('fabric', fabric);
    wallet = manager.createEntity().put(fabric.wallet());
    manager.putSingletonEntity('wallet', wallet);

    eventManager = new EventManager();
    
    worldMock = {
        elapsedTime: 1000000,
        getEntityComponentManager: () => manager,
        getEventManager: () => eventManager,
        getGameLoop: function() {
            const et = this.elapsedTime;
            return {
                getElapsedTime: () => et
            }
        },
    };
});

test(`update(groupName, world):
        there are not 'seeds' events
        => don't plant new vegetables,
           don't spend money`,
    () => {
        let entity = manager.createEntity();
        entity.put(GardenBedCell.of(0, 0));
        manager.bindEntity(entity);
        let expected = entity.clone();

        let system = new PlantNewVegetableSystem(manager, () => 0.1);
        system.update('update', worldMock);

        expect(entity).toEqualEntity(expected);
        expect(wallet.get(Wallet).sum).toEqual(20);
    });

test(`update(groupName, world):
        there are 'seeds' events,
        there are not entities with GardenBedCell component
        => don't plant new vegetables,
           don't spend money`,
    () => {
        let entity = manager.createEntity();
        manager.bindEntity(entity);
        eventManager.writeEvent('seeds', {tool: 'seeds', cell: 'center'});

        let system = new PlantNewVegetableSystem(manager, () => 0.1);
        system.update('update', worldMock);
        let actual = [...manager.select(manager.createFilter().all(VegetableMeta))];

        expect(actual).toHaveLength(0);
        expect(wallet.get(Wallet).sum).toEqual(20);
    });

test(`update(groupName, world):
        there are 'seeds' events,
        there are not entities with empty GardenBedCell component
        => don't plant new vegetables,
           don't spend money`,
    () => {
        let entity = manager.createEntity();
        let entity2 = manager.createEntity();
        entity.put(new GardenBedCell(0, 0, entity2));
        manager.bindEntity(entity);
        manager.bindEntity(entity2);
        eventManager.writeEvent('seeds', {tool: 'seeds', cell: 'center'});
        let expected = entity.clone();

        let system = new PlantNewVegetableSystem(manager, () => 0.1);
        system.update('update', worldMock);
        let actual = [...manager.select(manager.createFilter().all(VegetableMeta))];

        expect(actual).toHaveLength(0);
        expect(entity).toEqualEntity(expected);
        expect(wallet.get(Wallet).sum).toEqual(20);
    });

test(`update(groupName, world):
        there are 'seeds' events,
        there are entities with empty GardenBedCell component
        => plant new vegetables,
           spend money,
           GardenBedCell componen has link to new vegetable,
           new vegetable must have VegetableMeta, GardenBedCellLink and VegetableState components`,
    () => {
        let entity = manager.createEntity();
        entity.put(GardenBedCell.of(0, 0));
        manager.bindEntity(entity);
        eventManager.writeEvent('seeds', {tool: 'seeds', cell: 'center'});

        let system = new PlantNewVegetableSystem(manager, () => 0.1);
        system.update('update', worldMock);
        let actual = [...manager.select(manager.createFilter().all(VegetableMeta))];

        expect(actual).toHaveLength(1);
        expect(actual[0].hasComponents(VegetableMeta, GardenBedCellLink, VegetableState)).toBe(true);
        expect(entity.get(GardenBedCell).entity).toBe(actual[0]);
        expect(wallet.get(Wallet).sum).toEqual(17);
    });

