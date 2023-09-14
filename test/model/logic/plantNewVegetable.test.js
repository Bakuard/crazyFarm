const {PlantNewVegetableSystem} = require('../../../src/code/model/logic/plantNewVegetable.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {VegetableState} = require('../../../src/code/model/logic/vegetableState.js');
const {Fabric} = require('../../../src/code/model/logic/fabric.js');
const {Wallet} = require('../../../src/code/model/logic/wallet.js');
const {Grid} = require('../../../src/code/model/logic/store/grid.js');

let fabric = null;
let manager = null;
let eventManager = null;
let wallet = null;
let grid = null;
function beforeEachTest() {
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
    wallet = manager.createEntity().put(fabric.wallet());
    grid = new Grid(4, 3);
    manager.putSingletonEntity('fabric', fabric);
    manager.putSingletonEntity('wallet', wallet);
    manager.putSingletonEntity('grid', grid);

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
};

function p(x, y) {
    return {x, y, toString() {return `{x: ${this.x}, y: ${this.y}}`}};
}

function createVegetable(x, y) {
    let metaComp = new VegetableMeta('Potato');
    let cellLinkComp = new GardenBedCellLink(x, y);
    let vegetableState = fabric.vegetableState(metaComp.typeName);
    let vegetable = manager.createEntity().put(metaComp, cellLinkComp, vegetableState);
    manager.bindEntity(vegetable);
    return vegetable;
}

describe.each([
    {seedsEventsCoordinates: [p(0, 0), p(1, 1), p(3, 2)],
    notEmptyCellsCoordinates: [p(0, 0), p(1, 1), p(3, 2)],
    money: 20, 
    seedsPrice: 2, 
    expectedNewVegetablesCoordinates: [], 
    expectedMoney: 20},

    {seedsEventsCoordinates: [],
    notEmptyCellsCoordinates: [],
    money: 20, 
    seedsPrice: 2, 
    expectedNewVegetablesCoordinates: [], 
    expectedMoney: 20},

    {seedsEventsCoordinates: [p(0, 0), p(1, 1), p(3, 2)],
    notEmptyCellsCoordinates: [],
    money: 20, 
    seedsPrice: 21, 
    expectedNewVegetablesCoordinates: [], 
    expectedMoney: 20},

    {seedsEventsCoordinates: [p(0, 0), p(1, 1), p(3, 2)],
    notEmptyCellsCoordinates: [],
    money: 20, 
    seedsPrice: 2, 
    expectedNewVegetablesCoordinates: [p(0, 0), p(1, 1), p(3, 2)], 
    expectedMoney: 14}
])(`update(groupName, world):`,
    ({seedsEventsCoordinates, notEmptyCellsCoordinates, money, seedsPrice, expectedNewVegetablesCoordinates, expectedMoney}) => {
        beforeEach(beforeEachTest);

        test(`seedsEventsCoordinates [${seedsEventsCoordinates}],
              notEmptyCellsCoordinates [${notEmptyCellsCoordinates}],
              money ${money},
              seedPrice ${seedsPrice}
              => expected new vegetables coordinates: ${expectedNewVegetablesCoordinates},
                 expectedMoney: ${expectedMoney},
                 not empty cells mustn't be changed,
                 grid cell has link to new vegetable,
                 new vegetable must have VegetableMeta, GardenBedCellLink and VegetableState components`,
        () => {
            seedsEventsCoordinates.forEach(pos => eventManager.writeEvent('seeds', {tool: 'seeds', cellX: pos.x, cellY: pos.y}));
            notEmptyCellsCoordinates.forEach(pos => grid.write(pos.x, pos.y, createVegetable(pos.x, pos.y)));
            wallet.get(Wallet).sum = money;
            wallet.get(Wallet).seedsPrice = seedsPrice;
            let gridClone = grid.clone(entity => entity);

            let system = new PlantNewVegetableSystem(() => 0.1);
            system.update('update', worldMock);

            expectedNewVegetablesCoordinates.forEach(pos => {
                expect(grid.get(pos.x, pos.y)).not.toBe(gridClone.get(pos.x, pos.y));
                expect(grid.get(pos.x, pos.y).hasComponents(VegetableMeta, GardenBedCellLink, VegetableState)).toBe(true);
            });
            expect(wallet.get(Wallet).sum).toEqual(expectedMoney);
            notEmptyCellsCoordinates.forEach(pos => {
                expect(grid.get(pos.x, pos.y)).toBe(gridClone.get(pos.x, pos.y));
            });
        });
    }
);